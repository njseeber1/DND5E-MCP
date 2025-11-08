# D&D 5e API MCP Server

A Model Context Protocol (MCP) server that provides tools to interact with the D&D 5e API. This server enables AI assistants to query Dungeons & Dragons 5th Edition data including spells, monsters, classes, equipment, and more.

---

## Features

### Available Tools

- **list_endpoints** - Get all available API endpoints
- **list_resources** - List all resources for a specific endpoint (e.g., all spells)
- **get_resource** - Get detailed information about a specific resource
- **search_spells** - Search spells with filters (level, school, class)
- **search_monsters** - Search monsters with filters (CR, type)
- **get_class_levels** - Get level progression for a class
- **get_class_spells** - Get all spells available to a class

### Supported Endpoints

- ability-scores
- alignments
- backgrounds
- classes
- conditions
- damage-types
- equipment-categories
- equipment
- feats
- features
- languages
- magic-items
- magic-schools
- monsters
- proficiencies
- races
- rule-sections
- rules
- skills
- spells
- subclasses
- subraces
- traits
- weapon-properties

---

## Installation

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)

### Quick Start with Docker

1. **Clone this repository:**
   ```bash
   git clone <repository-url>
   cd dnd5e-mcp-server
   ```

2. **Create the project structure:**
   ```bash
   mkdir -p src
   # Move server.ts to src/server.ts
   ```

3. **Build and run with Docker Compose:**
   ```bash
   docker-compose up -d --build
   ```

   Or build and run with Docker directly:
   ```bash
   docker build -t dnd5e-mcp-server .
   docker run -i dnd5e-mcp-server
   ```

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the TypeScript code:**
   ```bash
   npm run build
   ```

3. **Run the server:**
   ```bash
   npm start
   ```

---

## Usage

### With Claude Desktop

Add this to your Claude Desktop configuration file:

- **MacOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "dnd5e": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "dnd5e-mcp-server:latest"]
    }
  }
}
```

Or for local development:

```json
{
  "mcpServers": {
    "dnd5e": {
      "command": "node",
      "args": ["/path/to/dnd5e-mcp-server/dist/server.js"]
    }
  }
}
```

### Example Queries

Once configured, you can ask Claude:

- "What spells can a 5th level wizard cast?"
- "Show me all CR 5 dragons"
- "Get details about the Fireball spell"
- "What equipment is available for a Fighter?"
- "List all 3rd level evocation spells"
- "What are the features of a 10th level Paladin?"

---

## API Reference

The server uses the [D&D 5e API](https://www.dnd5eapi.co/) which provides data from the D&D 5th Edition System Reference Document (SRD).

### Example Tool Calls

**Get a specific spell:**
```json
{
  "name": "get_resource",
  "arguments": {
    "endpoint": "spells",
    "index": "fireball"
  }
}
```

**Search for spells:**
```json
{
  "name": "search_spells",
  "arguments": {
    "level": 3,
    "school": "evocation",
    "class": "wizard"
  }
}
```

**Get monster by CR:**
```json
{
  "name": "search_monsters",
  "arguments": {
    "challenge_rating": 10,
    "type": "dragon"
  }
}
```

---

## Development

### Project Structure

```
dnd5e-mcp-server/
├── src/
│   └── server.ts          # Main server implementation
├── dist/                  # Compiled JavaScript (generated)
├── Dockerfile            # Docker image definition
├── docker-compose.yml    # Docker Compose configuration
├── package.json          # Node.js dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

### Building

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run build

# Build Docker image
docker build -t dnd5e-mcp-server .
```

### Testing

You can test the MCP server using the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node dist/server.js
```

---

## License

MIT License

---

## Credits

- Built on the [Model Context Protocol SDK](https://modelcontextprotocol.io)
- Data provided by the [D&D 5e API](https://www.dnd5eapi.co/)
- D&D 5e content is from the Systems Reference Document (SRD) under the Open Game License (OGL)

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## Support

For issues related to:

- **MCP Server:** Open an issue in this repository
- **D&D 5e API:** Visit [5e-bits/5e-srd-api](https://github.com/5e-bits/5e-srd-api)
- **MCP Protocol:** Visit [Model Context Protocol](https://modelcontextprotocol.io)