# Guild Text List

A [shelter](https://shelter.uwu.network/) plugin that converts Discord's icon-based server sidebar into a compact text list.

## Features

- Servers displayed as text instead of icons
- Folders become collapsible section headers
- Drag-to-reorder servers with persistent ordering
- Resizable sidebar width (drag the right edge)
- Shift+right-click to add/remove separators between servers
- DMs and Add Server converted to text
- Selected server indicator (left border + background)
- Respects `prefers-reduced-motion`

## Development

```bash
bun install
bunx lune dev plugins/guild-text-list
```

Then enable **Lune Dev Mode** in shelter settings. Changes hot-reload automatically.

## Build

```bash
bunx lune build plugins/guild-text-list
```

## License

MIT
