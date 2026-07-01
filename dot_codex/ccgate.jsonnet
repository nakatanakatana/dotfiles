{
  provider: {
    name: 'openai',
    model: 'google/gemma-4-e4b',
    base_url: 'http://localhost:1234/v1',
    auth: {
      type: 'exec',
      command: 'echo dummy',
      refresh_margin_ms: 6000000,
    },
  },
}
