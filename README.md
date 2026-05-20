# CodeBrew Cyber

CodeBrew Cyber is a Hugo site for a cyber security blog and portfolio, using the Blowfish theme as a Hugo module.

## Local Development

Install Hugo Extended and Go, then run:

```powershell
hugo server -D
```

The Blowfish theme is configured as a Hugo module in `config/_default/module.toml`, so Hugo will download it through Go module tooling on the first build.

## GitHub Pages

This repo includes `.github/workflows/hugo.yaml`, which builds the site with Hugo Extended and deploys the generated `public` directory to GitHub Pages.

In the GitHub repository, set **Settings > Pages > Build and deployment > Source** to **GitHub Actions**.

The workflow uses the Pages-provided base URL during the build, so it works for both user/organization pages and project pages.

