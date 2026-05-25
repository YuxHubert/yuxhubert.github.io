# Personal Blog Website Design

## Goal

Create and deploy a personal blog at `https://yuxhubert.github.io/` with a maintainable static-site workflow. The site should be easy to update by adding Markdown posts, and every push to the main branch should trigger continuous integration and deployment through GitHub Pages.

## Scope

The first release will include:

- An Astro static site using Markdown content.
- A responsive personal blog interface with a home page, post index, and post detail pages.
- A small set of starter posts so the site is useful immediately.
- Global styling for readable long-form writing on desktop and mobile.
- GitHub Actions CI/CD for build and deployment to GitHub Pages.
- Git repository setup, remote setup, repository creation through GitHub CLI when available, push, and deployment verification.

The first release will not include comments, authentication, CMS editing, search indexing, analytics, database storage, or a custom domain. Those can be added later without changing the core publishing model.

## Architecture

The site will be built with Astro and generated as static HTML. Blog posts will live as Markdown files under the Astro content area. Astro will parse post metadata such as title, description, date, and tags from frontmatter, then render static routes for the post list and individual posts.

The project will use npm scripts for local development, type checking where practical, and production builds. The generated output will be deployed by GitHub Actions using the official GitHub Pages Actions flow.

## Pages and Content

The home page will introduce the author and surface recent posts. The posts page will list all posts in reverse chronological order with dates, descriptions, and tags. Each post detail page will provide a focused reading layout with clear typography and navigation back to the post index.

Starter content will be neutral and easy to replace. The structure will make future publishing simple: create a Markdown file, fill in frontmatter, write the post body, commit, and push.

## Visual Design

The visual direction will be clean, calm, and writing-focused. The layout will avoid a marketing landing page and instead open directly as a usable blog. It will use restrained colors, readable spacing, and responsive navigation. Cards may be used for repeated post previews, but page sections will remain simple and unframed.

## CI/CD and Deployment

The GitHub Actions workflow will run on pushes to `main`. It will:

- Check out the repository.
- Set up Node.js.
- Install dependencies with `npm ci`.
- Build the Astro site.
- Upload the generated `dist` directory.
- Deploy to GitHub Pages.

The target repository is `yuxhubert/yuxhubert.github.io`, which maps to `https://yuxhubert.github.io/`. GitHub CLI will be the preferred control path for creating or reusing the repository and checking deployment status. If authentication, browser confirmation, or repository settings require user approval, the user will confirm those steps directly.

## Error Handling

Build errors should fail the GitHub Actions workflow before deployment. Missing or malformed post metadata should be caught during the local build where possible. Deployment errors will be inspected through `gh` and GitHub Actions logs, then fixed in the project configuration or repository settings.

## Testing and Verification

Verification will include:

- Local dependency installation.
- Local production build.
- Local preview or static inspection of generated output.
- GitHub Actions workflow status after push.
- Final check that `https://yuxhubert.github.io/` is reachable after deployment completes.

## Implementation Boundaries

The initial implementation should stay small and reliable. It should not introduce a backend, database, CMS, or complex theme system. The priority is a working blog pipeline that can be maintained by editing Markdown and pushing to GitHub.
