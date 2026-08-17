# Как работает генератор подписок Mihomo (подробно)

Основной файл: `src/modules/subscription-template/generators/mihomo.generator.service.ts` (784 строки).
Stash — не отдельный генератор, а тот же `MihomoGeneratorService` с флагом `isStash=true`
(некоторые вещи типа xhttp там просто отфильтровываются, см. ниже).

## 0. Откуда генератор вообще вызывается

`RenderTemplatesService.generateSubscription()` — единая точка входа для всех форматов подписки
(`src/modules/subscription-template/render-templates.service.ts:27-107`):

```typescript
public async generateSubscription(params: IGenerateSubscription): Promise<{
    contentType: string;
    subscription: string;
}> {
    const { srrContext, user, hosts, hostsOverrides, fallbackOptions } = params;

    // 1. Сначала ВСЕГДА нормализуем хосты — это общий шаг для всех форматов
    const formattedHosts = await this.resolveProxyConfigService.resolveProxyConfig({
        subscriptionSettings: srrContext.subscriptionSettings,
        hosts, user, hostsOverrides, fallbackOptions,
        excludeHostsByTags: srrContext.excludeHostsByTags,
    });

    // 2. Потом просто диспетчеризация по типу ответа
    switch (srrContext.matchedResponseType) {
        case 'MIHOMO':
            return {
                subscription: await this.mihomoGeneratorService.generateConfig(
                    formattedHosts,
                    false,                          // isStash
                    srrContext.isExtendedClient,     // extended-client флаги (например, serverDescription)
                    srrContext.overrideTemplateName,
                ),
                contentType: SUBSCRIPTION_CONFIG_TYPES['MIHOMO'].CONTENT_TYPE,
            };

        case 'STASH':
            return {
                subscription: await this.mihomoGeneratorService.generateConfig(
                    formattedHosts,
                    true,    // isStash
                    false,   // ⚠️ extended-client для Stash ВСЕГДА false, даже если клиент extended
                    srrContext.overrideTemplateName,
                ),
                contentType: SUBSCRIPTION_CONFIG_TYPES['STASH'].CONTENT_TYPE,
            };
        // ... CLASH / SINGBOX / XRAY_BASE64 / XRAY_JSON — другие генераторы
    }
}
```

`srrContext.matchedResponseType` определяется правилами Subscription Response Rules (SRR) —
это отдельная система детекта клиента по User-Agent/заголовкам, не относится к генератору напрямую.

## 1. Откуда берутся входные данные — `ResolvedProxyConfig`

Прежде чем генератор увидит хоть один хост, `ResolveProxyConfigService` превращает "сырые" данные
(хосты из БД + инбаунды профиля конфига + секреты юзера + оверрайды) в единый плоский нормализованный
тип, который используют **все** генераторы (mihomo/clash/singbox/xray/xray-json), не только mihomo:

`src/modules/subscription-template/resolve-proxy/interfaces/resolved-proxy-config.interface.ts`

```typescript
export type ResolvedProxyConfig = {
    finalRemark: string;
    address: string;
    port: number;

    streamOverrides: {
        finalMask: Record<string, unknown> | null;   // применённые stream-маски (в т.ч. hysteria2 obfs)
        sockopt: Record<string, unknown> | null;
    };

    mux: Record<string, unknown> | null;              // сырые mux-параметры инбаунда (включая smux)

    clientOverrides: {
        shuffleHost: boolean;
        mihomoX25519: boolean;                         // включить support-x25519mlkem768 в reality
        mihomoIpVersion: TMihomoIpVersion | null;       // форсировать ip-version в Mihomo
        serverDescription: string | null;               // для extended-клиентов, base64
        xrayJsonTemplate: object | null;
    };

    metadata: IProxyEntryMetadata;                     // uuid, tags, isHidden, excludeFromSubscriptionTypes...
} & ProtocolVariant & SecurityVariant & TransportVariant;
```

`ProtocolVariant` / `TransportVariant` / `SecurityVariant` — это **дискриминированные объединения**
(discriminated unions): например, если `protocol === 'vless'`, TypeScript точно знает, что
`protocolOptions` — это `IVlessProtocolOptions` (`{ encryption, id, flow }`), а не что-то ещё.
То же самое для `transport` (`tcp | xhttp | ws | httpupgrade | grpc | kcp | hysteria`) и
`security` (`tls | reality | none`). Именно поэтому в генераторе `switch (host.protocol)` /
`switch (host.transport)` спокойно обращается к специфичным полям без доп. проверок — TS их сам
сузил.

```typescript
export interface IXhttpTransportOptions {
    path: string | null;
    host: string | null;
    mode: SplitHTTPMode;                  // 'auto' | 'packet-up' | 'stream-up' | 'stream-one'
    extra: Record<string, unknown> | null;  // сюда попадают все xmux/downloadSettings/паддинги и т.д.
}
```

## 2. Шаблон и его кэширование

Шаблон (YAML со скелетом `dns`/`proxy-groups`/`rules`, который редактирует админ в панели)
загружается и парсится **не на каждый запрос**, а кэшируется на час:

`src/modules/subscription-template/subscription-template.service.ts:299-357`

```typescript
public async getCachedTemplateByType(
    type: TSubscriptionTemplateType,
    name: string = DEFAULT_TEMPLATE_NAME,
): Promise<object> {
    const cached = await this.rawCacheService.get<object>(
        CACHE_KEYS.SUBSCRIPTION_TEMPLATE(name, type), true,
    );
    if (cached) return cached;

    const template = await this.subscriptionTemplateRepository
        .getTemplateByNameAndTypeOrGetDefault(name, type);

    let templateContent: unknown | object | null = null;
    switch (template.templateType) {
        case 'MIHOMO':
        case 'STASH':
        case 'CLASH':
            templateContent = load(template.templateYaml!, {
                schema: YAML_MERGE_SCHEMA,   // разрешает YAML merge-keys (`<<: *anchor`)
                maxAliases: -1,               // без лимита на количество алиасов
                maxTotalMergeKeys: -1,        // без лимита на merge-ключи
            });
            break;
        case 'SINGBOX':
        case 'XRAY_JSON':
            templateContent = template.templateJson;
            break;
    }

    await this.rawCacheService.set(
        CACHE_KEYS.SUBSCRIPTION_TEMPLATE(name, type), templateContent, 3_600,
    );
    return templateContent;
}
```

`maxAliases: -1` / `maxTotalMergeKeys: -1` — намеренно сняты лимиты js-yaml (по умолчанию защита
от YAML-бомб), потому что админские шаблоны легитимно используют якоря/мердж для DRY-конфигов
(`<<: *base_dns` и т.п.), и это не пользовательский ввод, а контент, который создаёт сам админ.

Дефолтный шаблон (если админ ничего не настраивал) — `src/modules/subscription-template/constants/default-templates.ts`:

```yaml
# DEFAULT_TEMPLATE_MIHOMO (сокращённо)
mixed-port: 7890
socks-port: 7891
redir-port: 7892
allow-lan: true
mode: global
dns:
  enable: true
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  nameserver: [1.1.1.1, 8.8.8.8]
  fake-ip-filter: [...]   # большой список для NTP/Apple/Xbox и т.п., чтобы не резолвить их через fake-ip

proxies: # LEAVE THIS LINE!      ← сюда генератор допишет свои прокси

proxy-groups:
  - name: '→ Remnawave'
    type: 'select'
    proxies: # LEAVE THIS LINE!  ← и сюда допишет имена прокси

rules:
  - MATCH,→ Remnawave
```

Stash-шаблон отличается: `mode: rule` вместо `global`, свой блок `rules` (PROCESS-NAME/DOMAIN-SUFFIX
для директ-исключений Apple/торрент-клиентов) и `script.shortcuts.quic` для блокировки QUIC/443 udp.

## 3. Основной цикл `generateConfig`

```typescript
public async generateConfig(
    hosts: ResolvedProxyConfig[],
    isStash = false,
    isExtendedClient = false,
    overrideTemplateName?: string,
): Promise<string> {
    const templateType = isStash ? 'STASH' : 'MIHOMO';
    const yamlConfigDb = await this.subscriptionTemplateService.getCachedTemplateByType(
        templateType, overrideTemplateName,
    );
    const yamlConfig = yamlConfigDb as Record<string, unknown>;
    const includeHidden =
        (yamlConfig.remnawave as RemnawaveRootConfig | undefined)?.includeHiddenHosts ?? false;

    const data: MihomoData = { proxies: [], rules: [] };
    const proxyRemarks: string[] = [];

    for (const host of hosts) {
        if (!includeHidden && host.metadata.isHidden) continue;
        if (host.metadata.excludeFromSubscriptionTypes.includes(templateType)) continue;
        if (UNSUPPORTED_TRANSPORTS.has(host.transport)) continue;   // kcp
        if (isStash && host.transport === 'xhttp') continue;        // xhttp только для Mihomo, не для Stash

        const node = this.buildProxyNode(host, isExtendedClient);
        if (!node) continue;

        data.proxies.push(node);
        proxyRemarks.push(host.finalRemark);
    }

    return await this.renderConfig(data, proxyRemarks, yamlConfig);
}
```

`yamlConfig.remnawave.includeHiddenHosts` — кастомный корневой ключ шаблона (не часть спецификации
Mihomo), позволяющий явно включить в подписку хосты, помеченные `isHidden` в панели. Он и все
остальные `remnawave.*`-ключи вырезаются из финального YAML перед выдачей клиенту (см. §6).

## 4. Постройка одной proxy-ноды

```typescript
private buildProxyNode(host: ResolvedProxyConfig, isExtendedClient: boolean): ProxyNode | null {
    if (host.protocol === 'hysteria') {
        return this.buildHysteria2Node(host, isExtendedClient);   // отдельная ветка, другая форма узла
    }

    const node: ProxyNode = {
        name: host.finalRemark,
        type: this.resolveClashType(host.protocol),      // 'shadowsocks' -> 'ss', иначе как есть
        server: host.address,
        port: host.port,
        network: this.resolveClashNetwork(host),
        udp: true,
        'ip-version': host.clientOverrides.mihomoIpVersion ?? undefined,
    };

    if (!this.applyProtocolFields(node, host)) return null;   // неизвестный протокол -> хост дропается

    this.applySecurityFields(node, host);
    this.applyTransportOpts(node, host);
    node['client-fingerprint'] = this.resolveFingerprint(host);

    if (isNonEmptyObject(host.mux) && 'smux' in host.mux) {
        node['smux'] = host.mux['smux'];    // мультиплексирование мьюкса, если задано в инбаунде
    }

    if (isExtendedClient && host.clientOverrides.serverDescription) {
        node.serverDescription = Buffer.from(
            host.clientOverrides.serverDescription, 'base64',
        ).toString();   // расширенное поле, которое понимают только "extended" клиенты (не стандарт Mihomo)
    }

    return node;
}
```

## 5. Протокол-специфичные поля (vless / trojan / shadowsocks)

```typescript
private applyProtocolFields(node: ProxyNode, host: ResolvedProxyConfig): boolean {
    switch (host.protocol) {
        case 'vless':
            node.uuid = host.protocolOptions.id;
            node['packet-encoding'] = 'xudp';
            if (host.protocolOptions.flow === 'xtls-rprx-vision') {
                node.flow = host.protocolOptions.flow;
            }
            if (host.protocolOptions.encryption && host.protocolOptions.encryption !== 'none') {
                node.encryption = host.protocolOptions.encryption;   // vless post-quantum encryption (ML-KEM)
            }
            return true;

        case 'trojan':
            node.password = host.protocolOptions.password;
            return true;

        case 'shadowsocks':
            node.password = host.protocolOptions.password;
            node.cipher = host.protocolOptions.method;
            node['udp-over-tcp'] = host.protocolOptions.uot;
            node['udp-over-tcp-version'] = host.protocolOptions.uotVersion;
            return true;

        default:
            return false;   // hysteria обработан раньше отдельной веткой; всё остальное — не поддержано
    }
}
```

Значит, из всего, что умеет генерировать панель, в Mihomo/Stash попадают **только**
vless / trojan / shadowsocks / hysteria2. Всё остальное молча выпадает из подписки на этапе фильтра.

## 6. TLS / Reality

```typescript
private applySecurityFields(node: ProxyNode, host: ResolvedProxyConfig): void {
    switch (host.security) {
        case 'tls': {
            const opts = host.securityOptions;
            node.tls = true;

            // ⚠️ у trojan в Mihomo поле называется `sni`, у всех остальных — `servername`
            if (node.type === 'trojan') node.sni = opts.serverName ?? '';
            else node.servername = opts.serverName ?? '';

            if (opts.alpn) node.alpn = opts.alpn.split(',');

            // allowInsecure переименован в pinnedPeerCertSha256 (см. коммит d3a5ac78)
            if (opts.pinnedPeerCertSha256 && node.type !== 'ss') {
                node['skip-cert-verify'] = true;   // для shadowsocks это поле не имеет смысла — не ставим
            }
            break;
        }
        case 'reality': {
            const opts = host.securityOptions;
            node.tls = true;

            if (node.type === 'trojan') node.sni = opts.serverName;
            else node.servername = opts.serverName;

            if (opts.publicKey) {
                const realityOpts: Record<string, unknown> = {
                    'public-key': opts.publicKey,
                    'short-id': opts.shortId,
                };
                if (host.clientOverrides.mihomoX25519) {
                    realityOpts['support-x25519mlkem768'] = true;   // пост-квантовый key exchange, не все клиенты умеют
                }
                node['reality-opts'] = realityOpts;
            }
            break;
        }
        case 'none':
            break;
    }
}

private resolveFingerprint(host: ResolvedProxyConfig): string {
    const raw = host.securityOptions?.fingerprint?.toLowerCase();
    if (!raw) return 'chrome';
    return FINGERPRINTS.find((fp) => raw.includes(fp)) ?? 'chrome';   // сверка с whitelist известных JA3-отпечатков
}
```

## 7. Транспорты (сеть) — `resolveClashNetwork` и `applyTransportOpts`

```typescript
private resolveClashNetwork(host: ResolvedProxyConfig): string {
    if (host.transport === 'tcp' && host.transportOptions.header?.type === 'http') {
        return 'http';           // Xray "tcp + http-заголовок" -> отдельный network-тип в Mihomo
    }
    if (host.transport === 'httpupgrade') {
        return 'ws';              // отдельного httpupgrade у Mihomo нет — это вариант ws
    }
    return host.transport;        // 'ws' | 'grpc' | 'xhttp' | 'tcp' — как есть
}

private applyTransportOpts(node: ProxyNode, host: ResolvedProxyConfig): void {
    let netOpts: NetworkConfig = {};

    switch (host.transport) {
        case 'ws':
            netOpts = this.buildWsOpts(
                host.transportOptions.path, host.transportOptions.host, host.transportOptions.headers,
            );
            break;
        case 'httpupgrade':
            netOpts = this.buildWsOpts(
                host.transportOptions.path, host.transportOptions.host, host.transportOptions.headers,
                true,   // isHttpUpgrade
            );
            break;
        case 'tcp':
            netOpts = this.buildTcpOpts();   // сейчас всегда {}
            break;
        case 'grpc':
            netOpts = this.buildGrpcOpts(host.transportOptions.serviceName);
            break;
        case 'xhttp':
            netOpts = this.buildXhttpOpts(host.transportOptions, host.clientOverrides.mihomoX25519);
            break;
        default:
            return;   // kcp сюда не доходит (отфильтрован раньше), hysteria — отдельная ветка
    }

    if (Object.keys(netOpts).length > 0) {
        node[`${node.network}-opts`] = netOpts;   // например 'ws-opts', 'grpc-opts', 'xhttp-opts'
    }
}
```

### `ws` / `httpupgrade` — early-data и заголовки

```typescript
private buildWsOpts(
    rawPath: string | null,
    host: string | null,
    headers: Record<string, string> | null,
    isHttpUpgrade = false,
): NetworkConfig {
    const config: NetworkConfig = {};
    let path = rawPath ?? '';
    let maxEarlyData: number | undefined;
    let earlyDataHeaderName = '';

    // legacy-конвенция: early-data закодирован прямо в пути как `?ed=2048`
    if (path.includes('?ed=')) {
        const [pathPart, edPart] = path.split('?ed=');
        path = pathPart;
        const parsed = parseInt(edPart.split('/')[0]);
        maxEarlyData = isNaN(parsed) ? undefined : parsed;
        earlyDataHeaderName = 'Sec-WebSocket-Protocol';
    }

    if (path) config.path = path;

    config.headers = host ? { Host: host } : {};
    if (headers !== null) config.headers = { ...config.headers, ...headers };

    if (maxEarlyData !== undefined) config['max-early-data'] = maxEarlyData;
    if (earlyDataHeaderName) config['early-data-header-name'] = earlyDataHeaderName;

    if (isHttpUpgrade) {
        config['v2ray-http-upgrade'] = true;
        config['v2ray-http-upgrade-fast-open'] = true;
    }

    return config;
}
```

Этот кусок с явным мерджем `headers` в `Host`-заголовок и вытаскиванием `?ed=` из пути был
фиксом (`fca285a4 "fix: include ws/hu headers in mihomo generator"`) — до него кастомные заголовки
для ws/httpupgrade в Mihomo-подписку не попадали вообще.

## 8. XHTTP — самая "толстая" часть генератора

XHTTP (он же SplitHTTP) — самый навороченный транспорт с кучей опций (паддинги, xmux-переиспользование
соединений, отдельный downstream-сервер). У Mihomo все эти поля называются иначе, чем у Xray
(camelCase → kebab-case + переименования), поэтому есть таблицы соответствий:

```typescript
const XHTTP_FIELD_MAP: [string, string, boolean?][] = [
    ['noGRPCHeader', 'no-grpc-header'],
    ['xPaddingBytes', 'x-padding-bytes', true],
    ['xPaddingObfsMode', 'x-padding-obfs-mode'],
    ['xPaddingKey', 'x-padding-key'],
    ['xPaddingHeader', 'x-padding-header'],
    ['xPaddingPlacement', 'x-padding-placement'],
    ['xPaddingMethod', 'x-padding-method'],
    ['uplinkHTTPMethod', 'uplink-http-method'],
    ['sessionIDPlacement', 'session-placement'],
    ['sessionIDKey', 'session-key'],
    ['sessionIDTable', 'session-table'],
    ['sessionIDLength', 'session-length', true],
    ['seqPlacement', 'seq-placement'],
    ['seqKey', 'seq-key'],
    ['uplinkDataPlacement', 'uplink-data-placement'],
    ['uplinkDataKey', 'uplink-data-key'],
    ['uplinkChunkSize', 'uplink-chunk-size'],
    ['scMaxEachPostBytes', 'sc-max-each-post-bytes'],
    ['scMinPostsIntervalMs', 'sc-min-posts-interval-ms'],
    ['scStreamUpServerSecs', 'sc-stream-up-server-secs', true],
];

const XMUX_FIELD_MAP: [string, string, boolean?][] = [
    ['maxConnections', 'max-connections', true],
    ['maxConcurrency', 'max-concurrency', true],
    ['cMaxReuseTimes', 'c-max-reuse-times', true],
    ['hMaxRequestTimes', 'h-max-request-times', true],
    ['hMaxReusableSecs', 'h-max-reusable-secs', true],
    ['hKeepAlivePeriod', 'h-keep-alive-period'],
];
```

Третий элемент кортежа (`true`) значит "привести к строке" — это нужно там, где Mihomo ожидает
числовое поле в виде строки, а не YAML-числа:

```typescript
private applyFieldMap(
    source: Record<string, unknown>,
    target: Record<string, unknown>,
    fieldMap: [string, string, boolean?][],
): void {
    for (const [src, dst, asString] of fieldMap) {
        if (source[src] !== undefined) {
            target[dst] = asString ? String(source[src]) : source[src];
        }
    }
}
```

Сама сборка `xhttp-opts`:

```typescript
private buildXhttpOpts(
    transportOptions: { path: string | null; host: string | null; mode: string; extra: Record<string, unknown> | null },
    mihomoX25519?: boolean,
): Record<string, unknown> {
    const config: Record<string, unknown> = {};

    if (transportOptions.path) config.path = transportOptions.path;
    if (transportOptions.host) config.host = transportOptions.host;
    if (transportOptions.mode) config.mode = transportOptions.mode;   // 'auto' | 'packet-up' | 'stream-up' | 'stream-one'

    const extra = transportOptions.extra;
    if (!extra) return config;

    if (extra.headers) config.headers = extra.headers;

    this.applyFieldMap(extra, config, XHTTP_FIELD_MAP);   // все паддинг/session/seq поля разом

    if (extra.xmux && typeof extra.xmux === 'object') {
        config['reuse-settings'] = this.buildXhttpReuseSettings(extra.xmux as Record<string, unknown>);
    }

    if (extra.downloadSettings && typeof extra.downloadSettings === 'object') {
        config['download-settings'] = this.buildXhttpDownloadSettings(
            extra.downloadSettings as Record<string, unknown>, mihomoX25519,
        );
    }

    return config;
}

private buildXhttpReuseSettings(xmux: Record<string, unknown>): Record<string, unknown> {
    const settings: Record<string, unknown> = {};
    this.applyFieldMap(xmux, settings, XMUX_FIELD_MAP);
    return settings;
}
```

`download-settings` — это отдельный сервер для downstream-канала XHTTP (XHTTP умеет разносить
upload/download на разные адреса). У него **своя** TLS/reality секция, полностью независимая от
основного узла:

```typescript
private buildXhttpDownloadSettings(
    ds: Record<string, unknown>,
    mihomoX25519?: boolean,
): Record<string, unknown> {
    const settings: Record<string, unknown> = {};

    if (ds.address) settings.server = ds.address;
    if (ds.port) settings.port = ds.port;

    if (ds.security === 'tls' || ds.security === 'reality') {
        settings.tls = true;

        const tlsSettings = ds.tlsSettings as Record<string, unknown> | undefined;
        if (tlsSettings) {
            if (tlsSettings.serverName) settings.servername = tlsSettings.serverName;
            if (tlsSettings.fingerprint) settings['client-fingerprint'] = tlsSettings.fingerprint;
            if (tlsSettings.alpn) settings.alpn = tlsSettings.alpn;
            if (tlsSettings.allowInsecure) settings['skip-cert-verify'] = true;
        }

        const realitySettings = ds.realitySettings as Record<string, unknown> | undefined;
        if (ds.security === 'reality' && realitySettings) {
            const realityOpts: Record<string, unknown> = {};
            if (realitySettings.publicKey) realityOpts['public-key'] = realitySettings.publicKey;
            if (realitySettings.shortId) realityOpts['short-id'] = realitySettings.shortId;
            if (mihomoX25519) realityOpts['support-x25519mlkem768'] = true;   // тот же квирк, что и в основной ноде
            if (Object.keys(realityOpts).length > 0) settings['reality-opts'] = realityOpts;
        }
    }

    // и у самого download-канала может быть свой xhttp path/host/headers/xmux
    const xhttpSettings = ds.xhttpSettings as Record<string, unknown> | undefined;
    if (xhttpSettings) {
        if (xhttpSettings.path) settings.path = xhttpSettings.path;
        if (xhttpSettings.host) settings.host = xhttpSettings.host;
        if (xhttpSettings.headers) settings.headers = xhttpSettings.headers;

        const extra = xhttpSettings.extra;
        if (extra && typeof extra === 'object') {
            const xmux = (extra as Record<string, unknown>).xmux;
            if (xmux && typeof xmux === 'object') {
                settings['reuse-settings'] = this.buildXhttpReuseSettings(xmux as Record<string, unknown>);
            }
        }
    }

    return settings;
}
```

Напомню: у **Stash** транспорт `xhttp` целиком выпиливается ещё на этапе фильтрации хостов
(`isStash && host.transport === 'xhttp'` в `generateConfig`) — весь этот код для Stash просто
не вызывается, потому что форк Stash не реализует XHTTP.

## 9. Hysteria2 — совсем отдельная ветка

Hysteria2 не укладывается в общую схему `network`/`tls`, поэтому у него полностью свой билдер:

```typescript
private buildHysteria2Node(host: ResolvedProxyConfig, isExtendedClient: boolean): ProxyNode | null {
    if (host.protocol !== 'hysteria' || host.transport !== 'hysteria') return null;

    const node: ProxyNode = {
        name: host.finalRemark,
        type: 'hysteria2',
        server: host.address,
        port: host.port,
        udp: true,
        password: host.transportOptions.auth,
        ...this.buildHysteria2QuicFields(host.streamOverrides.finalMask),
        ...this.buildHysteria2ObfsFields(host.streamOverrides.finalMask),
        ...this.buildHysteria2TlsFields(host),
    };

    if (isExtendedClient && host.clientOverrides.serverDescription) {
        node.serverDescription = Buffer.from(host.clientOverrides.serverDescription, 'base64').toString();
    }
    return node;
}

private buildHysteria2QuicFields(finalMask: Record<string, unknown> | null): Record<string, unknown> {
    const { brutalUp, brutalDown, udpHop, bbrProfile } =
        (finalMask as Hysteria2FinalMask | null)?.quicParams ?? {};

    return {
        ...(brutalUp && { up: String(brutalUp) }),
        ...(brutalDown && { down: String(brutalDown) }),
        ...(udpHop?.ports && { ports: String(udpHop.ports) }),          // UDP hop-порты (обход блокировки по порту)
        ...(udpHop?.interval && { 'hop-interval': String(udpHop.interval) }),
        ...(bbrProfile && { 'bbr-profile': bbrProfile }),
    };
}
```

### Фикс с "gecko"-обфускацией (issue/PR #194)

```typescript
private buildHysteria2ObfsFields(
    finalMask: Record<string, unknown> | null,
): Hysteria2ObfsFields | Record<string, never> {
    const mask = this.findHysteria2Mask(finalMask);   // ищет salamander-маску в finalMask.udp[]
    if (!mask) return {};

    const { password, packetSize } = mask.settings;

    if (!packetSize) {
        return { obfs: 'salamander', 'obfs-password': password };
    }

    // если задан packetSize — у Mihomo для этого ОТДЕЛЬНЫЙ тип обфускатора 'gecko',
    // а не 'salamander' с доп.параметрами размера пакета
    const { from, to } = parseIntRangeUtil(packetSize);   // '100-200' -> { from: 100, to: 200 }
    return {
        obfs: 'gecko',
        'obfs-password': password,
        ...(from && { 'obfs-min-packet-size': from }),
        ...(to && { 'obfs-max-packet-size': to }),
    };
}

private findHysteria2Mask(finalMask: Record<string, unknown> | null): Hysteria2Mask | null {
    const udp = finalMask?.udp;
    if (!Array.isArray(udp)) return null;
    return udp.find((mask): mask is Hysteria2Mask => this.isHysteria2Mask(mask)) ?? null;
}
```

До этого фикса маска с заданным `packetSize` уходила в Mihomo как `obfs: salamander` с
несуществующими у salamander полями `obfs-min/max-packet-size`, что Mihomo просто игнорировал —
пакет-сайзинг у обфускации фактически не работал.

```typescript
private buildHysteria2TlsFields(host: ResolvedProxyConfig): Record<string, unknown> {
    if (host.security !== 'tls') return {};
    const { serverName, pinnedPeerCertSha256, fingerprint, alpn } = host.securityOptions;

    return {
        ...(serverName && { sni: serverName }),                       // у hysteria2 в Mihomo тоже `sni`, не `servername`
        ...(pinnedPeerCertSha256 && { 'skip-cert-verify': true }),
        ...(fingerprint && { 'client-fingerprint': fingerprint }),
        ...(alpn && { alpn: alpn.split(',') }),
    };
}
```

## 10. Финальная склейка с шаблоном — `renderConfig`

```typescript
private async renderConfig(
    data: MihomoData,
    proxyRemarks: string[],
    yamlConfig: Record<string, unknown>,
): Promise<string> {
    const { remnawave: _remnawave, ...templateConfig } = yamlConfig;   // вырезаем корневой remnawave-ключ

    const sourceGroups = Array.isArray(templateConfig['proxy-groups'])
        ? (templateConfig['proxy-groups'] as Record<string, unknown>[])
        : [];

    const finalConfig: Record<string, unknown> = {
        ...templateConfig,
        proxies: [
            ...(Array.isArray(yamlConfig.proxies) ? (yamlConfig.proxies as ProxyNode[]) : []),
            ...data.proxies,   // сгенерированные ноды добавляются к тем, что уже прописаны в шаблоне вручную
        ],
        'proxy-groups': sourceGroups.map((group) => {
            const remnawaveCustom = group.remnawave as Record<string, unknown> | undefined;
            const { remnawave: _remnawave, ...restGroup } = group;
            const cleanGroup = remnawaveCustom ? restGroup : group;

            const remarks = this.resolveGroupRemarks(remnawaveCustom, proxyRemarks);

            return {
                ...cleanGroup,
                proxies: [
                    ...(Array.isArray(cleanGroup.proxies) ? (cleanGroup.proxies as string[]) : []),
                    ...remarks,
                ],
            };
        }),
    };

    const providers = this.buildProxyProviders(yamlConfig, data);
    if (providers) finalConfig['proxy-providers'] = providers;

    return dump(finalConfig);   // js-yaml сериализует весь объект обратно в YAML-строку
}
```

### Как решается, какие имена прокси попадут в конкретную `proxy-group`

Каждая группа в шаблоне может иметь кастомный подобъект `remnawave` (тоже вырезается перед выдачей):

```typescript
private resolveGroupRemarks(
    remnawaveCustom: Record<string, unknown> | undefined,
    proxyRemarks: string[],
): string[] {
    if (!remnawaveCustom) return [...proxyRemarks];                       // без спец-настроек — все прокси как есть

    if (remnawaveCustom['include-proxies'] === false) return [];          // явно пустая группа

    if (remnawaveCustom['select-random-proxy'] === true) {
        const random = proxyRemarks[Math.floor(Math.random() * proxyRemarks.length)];
        return random ? [random] : [];                                    // группа "случайный выход" — 1 прокси
    }

    if (remnawaveCustom['shuffle-proxies-order'] === true) {
        return _.shuffle(proxyRemarks);                                   // тот же список, но перемешанный
    }

    return [...proxyRemarks];
}
```

Пример использования в шаблоне (не часть кода, а то, что может написать админ в панели):

```yaml
proxy-groups:
  - name: '→ Remnawave'
    type: select
    proxies: # LEAVE THIS LINE!
  - name: 'Random Exit'
    type: select
    remnawave:
      select-random-proxy: true
    proxies: # LEAVE THIS LINE!
```

### Proxy-providers (динамические провайдеры Mihomo)

```typescript
private buildProxyProviders(
    yamlConfig: Record<string, unknown>,
    data: MihomoData,
): Record<string, Record<string, unknown>> | undefined {
    const providers = yamlConfig['proxy-providers'] as Record<string, Record<string, unknown>> | undefined;
    if (!providers) return undefined;

    return Object.fromEntries(
        Object.entries(providers).map(([providerKey, provider]) => {
            const remnawaveCustom = provider.remnawave as Record<string, unknown> | undefined;
            if (!remnawaveCustom) return [providerKey, provider];

            const { remnawave: _remnawave, ...cleanProvider } = provider;

            if (remnawaveCustom['include-proxies'] === true) {
                // весь сгенерированный список прокси зашивается статическим payload'ом в провайдер
                return [providerKey, { ...cleanProvider, payload: [...data.proxies] }];
            }
            return [providerKey, cleanProvider];
        }),
    );
}
```

## Сводная таблица квирков

| Квирк | Суть | Где в коде |
|---|---|---|
| `trojan` → `sni`, остальные → `servername` | Разные имена одного и того же TLS SNI-поля в схеме Mihomo | `applySecurityFields`, `buildHysteria2TlsFields` |
| `skip-cert-verify` не ставится для `ss` | У Shadowsocks нет TLS-слоя, флаг бессмысленен | `applySecurityFields` |
| `httpupgrade` = `network: ws` + `v2ray-http-upgrade` | У Mihomo нет отдельного httpupgrade-транспорта | `resolveClashNetwork`, `buildWsOpts` |
| `tcp` + http-заголовок → отдельный `network: http` | Xray-специфичная маскировка сворачивается в свой тип сети | `resolveClashNetwork` |
| `?ed=` в пути → `max-early-data` / `early-data-header-name` | Legacy-кодирование early-data в URL конвертируется в нативные поля | `buildWsOpts` |
| `salamander` + `packetSize` → обфускатор `gecko` | У Mihomo пакет-сайзинг обфускации — отдельный тип, не доп.поля salamander | `buildHysteria2ObfsFields` |
| `support-x25519mlkem768` (пост-квантовый reality) | Опционально по `clientOverrides.mihomoX25519`, не все Mihomo-сборки это умеют | `applySecurityFields`, `buildXhttpDownloadSettings` |
| `kcp` всегда дропается | Mihomo не реализует mKCP | `generateConfig` (`UNSUPPORTED_TRANSPORTS`) |
| `xhttp` дропается только для Stash | Форк Stash не реализует XHTTP, хотя основной Mihomo — умеет | `generateConfig` |
| Stash всегда `isExtendedClient=false` | Даже если реальный клиент "extended", для Stash это поле форсированно выключено | `render-templates.service.ts` (case `STASH`) |
| camelCase → kebab-case для xhttp/xmux полей | Собственные таблицы соответствий имён полей | `XHTTP_FIELD_MAP`, `XMUX_FIELD_MAP` |
| Только vless/trojan/shadowsocks/hysteria2 | Все остальные протоколы (shadowsocks-2022 варианты вне списка, vmess и т.д. если не входят в switch) молча выпадают | `applyProtocolFields` (`default: return false`) |
| `remnawave.*` — кастомные YAML-ключи | `includeHiddenHosts` (корень), `include-proxies`/`select-random-proxy`/`shuffle-proxies-order` (группы/провайдеры) — парсятся и вырезаются перед выдачей | `renderConfig`, `resolveGroupRemarks`, `buildProxyProviders` |

## Карта файлов

```
src/modules/subscription-template/
├── generators/
│   ├── mihomo.generator.service.ts        ← весь разобранный код
│   └── index.ts                            ← регистрация в TEMPLATE_RENDERERS
├── render-templates.service.ts             ← диспетчер по matchedResponseType
├── subscription-template.service.ts        ← загрузка/кэш YAML-шаблона (1ч, YAML_MERGE_SCHEMA)
├── constants/
│   ├── default-templates.ts                ← дефолтные YAML для MIHOMO/STASH/CLASH
│   └── config-types.ts                     ← content-type на каждый формат подписки
└── resolve-proxy/
    ├── resolve-proxy-config.service.ts     ← собирает ResolvedProxyConfig[] из хостов+юзера+инбаундов
    └── interfaces/
        └── resolved-proxy-config.interface.ts   ← дискриминированные union-типы protocol/transport/security
```
