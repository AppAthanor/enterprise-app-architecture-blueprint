# Enterprise App Architecture Blueprint System

An interactive visualization and documentation system for enterprise application architecture using C4-style diagrams.

## Overview

This system provides a maintainable, interactive enterprise architecture documentation and visualization platform for mobile applications. It features:

- C4-style architecture diagrams showing capabilities, relationships, and hierarchy
- Clear visualization of metadata (status, criticality, domain, owner)
- Visually distinct relationship lines between components
- Organized, scalable layout for clarity and future collaboration
- MDX-based documentation with frontmatter metadata

## Getting Started

```bash
# Install dependencies
npm install

# Extract blueprint data
npm run extract-blueprint

# Start the development server
npm start
```

## Adding New Capabilities

1. Create a new MDX file in the appropriate directory:
   - Pillar capabilities: `docs/capabilities/`
   - Sub-capabilities: `docs/capabilities/[parent-pillar]/sub-capabilities/`

2. Include the proper frontmatter metadata with relationships

3. Run the extraction script to update the visualization data:
   ```bash
   npm run extract-blueprint
   ```

## Built With

- [Docusaurus 2](https://docusaurus.io/) - The documentation framework
- [React Flow](https://reactflow.dev/) - For interactive diagrams
- [MDX](https://mdxjs.com/) - For enhanced markdown with React components

### Installation

```
$ yarn
```

### Local Development

```
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

Using SSH:

```
$ USE_SSH=true yarn deploy
```

Not using SSH:

```
$ GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
