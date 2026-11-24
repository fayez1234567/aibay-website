# PadelBase marketing website

Static marketing site for **aibay.co.uk**. The site uses HTML, CSS and JavaScript. It works on standard cPanel shared hosting and requires no Node.js server, database or paid API. It has no connection to the app, Supabase or Stripe.

## Local preview

From the repository root, run:

```sh
python3 -m http.server 8000
```

Open the address printed by Python in a browser. Check the homepage, mobile menu, app gallery, FAQ and both enquiry forms. Use smaller viewport sizes to check the mobile and tablet layouts.

## Configure before publishing

Edit `assets/config.js`. It contains public settings only. Keep tokens and secrets out of the repository.

- **App screenshots** Put approved, optimised originals in `assets/screenshots/` and assign their relative paths to `screenshots.book`, `screenshots.matches`, `screenshots.profile` and `screenshots.rankings`. Illustrative phone screens are used until the corresponding file loads. Review the screenshots for personal information and any venue or price examples before publishing.
- **Contact and club enquiries** Set `contactEmail` and optionally a separate `clubEmail` to enable an email draft. If you provide a public HTTPS `formEndpoints.contact` or `formEndpoints.club`, the respective form will POST URL-encoded fields and expect a successful HTTP response. For cross-origin endpoints enable CORS for your site, handle spam and server-side validation at the endpoint, and test that messages reach the intended inbox. Without a verified address or endpoint, visitors can download a plain-text enquiry and no submission is sent.
- **Store and social links** Add verified app listing URLs to `appStores` and verified public profile links to `social`. Empty fields are hidden.
- **Product status and legal copy** Confirm live feature availability and review the Privacy Policy and Terms and Conditions with the website operator before publishing. Update the privacy notice to match the chosen enquiry service and actual data-handling practices.

## Netlify preview

Import the repository into Netlify with **no build command** and the repository root as the publish directory. The included `netlify.toml` sets the publish directory and adds a noindex header to preview responses. For a manual upload, use a folder with the HTML files, `assets/`, `robots.txt`, `sitemap.xml` and `netlify.toml` at its root. Confirm the noindex header if search visibility matters. Leave the production domain disconnected from the preview.

## cPanel deployment after approval

1. Confirm the document root for aibay.co.uk under **Domains** in cPanel and back up the current site before replacing any content.
2. Upload the root HTML files, the complete `assets/` folder, `robots.txt` and `sitemap.xml` to the approved document root, typically `public_html/`. Include `index.html` at its root. If an existing application handles index routes, review its index order and rewrite rules before switching traffic. Netlify configuration and repository metadata are unnecessary on cPanel.
3. Verify HTTPS and test the homepage, all page links, the forms and the sitemap on the production hostname.

The canonical URLs, social metadata and sitemap target `https://aibay.co.uk/`. Hero and court photography are generated editorial assets. The mockups show example app interfaces.
