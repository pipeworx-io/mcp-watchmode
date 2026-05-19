interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Watchmode MCP.
 */


const BASE = 'https://api.watchmode.com/v1';
const UA = 'pipeworx-mcp-watchmode/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'title_search',
    description: 'Search titles.',
    inputSchema: { type: 'object', properties: { search_value: { type: 'string' }, search_field: { type: 'string' }, types: { type: 'string' } }, required: ['search_value'] },
  },
  { name: 'title_detail', description: 'Title detail.', inputSchema: { type: 'object', properties: { title_id: { type: 'string' }, append_to_response: { type: 'string' } }, required: ['title_id'] } },
  { name: 'title_sources', description: 'Streaming sources.', inputSchema: { type: 'object', properties: { title_id: { type: 'string' }, regions: { type: 'string' } }, required: ['title_id'] } },
  { name: 'title_seasons', description: 'Seasons.', inputSchema: { type: 'object', properties: { title_id: { type: 'string' } }, required: ['title_id'] } },
  {
    name: 'releases',
    description: 'Recent/upcoming releases.',
    inputSchema: {
      type: 'object',
      properties: { start_date: { type: 'string' }, end_date: { type: 'string' }, limit: { type: 'number' }, regions: { type: 'string' }, source_ids: { type: 'string' }, source_types: { type: 'string' }, types: { type: 'string' }, regions_pricing: { type: 'string' } },
    },
  },
  {
    name: 'list_titles',
    description: 'Title catalog.',
    inputSchema: {
      type: 'object',
      properties: {
        types: { type: 'string' },
        regions: { type: 'string' },
        source_ids: { type: 'string' },
        source_types: { type: 'string' },
        genres: { type: 'string' },
        networks: { type: 'string' },
        release_date_start: { type: 'string' },
        release_date_end: { type: 'string' },
        sort_by: { type: 'string' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  },
  { name: 'sources', description: 'Streaming sources/services.', inputSchema: { type: 'object', properties: {} } },
  { name: 'networks', description: 'Networks.', inputSchema: { type: 'object', properties: {} } },
  { name: 'genres', description: 'Genres.', inputSchema: { type: 'object', properties: {} } },
  { name: 'regions', description: 'Regions.', inputSchema: { type: 'object', properties: {} } },
  { name: 'languages', description: 'Languages.', inputSchema: { type: 'object', properties: {} } },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = (args._apiKey as string | undefined)?.trim();
  if (!apiKey) throw new Error('Watchmode requires an API key. Set PLATFORM_WATCHMODE_KEY or pass ?_apiKey=… (free at https://api.watchmode.com/).');
  const get = async (path: string, extras: Record<string, unknown> = {}) => {
    const p = new URLSearchParams({ apiKey });
    for (const [k, v] of Object.entries(extras)) {
      if (k === '_apiKey' || v == null) continue;
      p.set(k, String(v));
    }
    const res = await fetch(`${BASE}${path}?${p}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
    if (res.status === 401 || res.status === 403) throw new Error('Watchmode: invalid API key.');
    if (!res.ok) throw new Error(`Watchmode: ${res.status}`);
    return res.json();
  };
  const pick = (keys: string[]) => Object.fromEntries(keys.map((k) => [k, args[k]]));
  const reqStr = (k: string, ex: string) => {
    const v = args[k];
    if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${k}" is missing. Pass a string like ${ex}.`);
    return v;
  };
  switch (name) {
    case 'title_search':
      return get('/search/', pick(['search_value', 'search_field', 'types']));
    case 'title_detail':
      return get(`/title/${encodeURIComponent(reqStr('title_id', '"3173903"'))}/details/`, pick(['append_to_response']));
    case 'title_sources':
      return get(`/title/${encodeURIComponent(reqStr('title_id', '"3173903"'))}/sources/`, pick(['regions']));
    case 'title_seasons':
      return get(`/title/${encodeURIComponent(reqStr('title_id', '"3173903"'))}/seasons/`);
    case 'releases':
      return get('/releases/', pick(['start_date', 'end_date', 'limit', 'regions', 'source_ids', 'source_types', 'types', 'regions_pricing']));
    case 'list_titles':
      return get('/list-titles/', pick(['types', 'regions', 'source_ids', 'source_types', 'genres', 'networks', 'release_date_start', 'release_date_end', 'sort_by', 'page', 'limit']));
    case 'sources':
      return get('/sources/');
    case 'networks':
      return get('/networks/');
    case 'genres':
      return get('/genres/');
    case 'regions':
      return get('/regions/');
    case 'languages':
      return get('/languages/');
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
