# Sankara Gomathi — Portfolio

A static portfolio site built with HTML, CSS, vanilla JavaScript, GSAP and ScrollTrigger. The contact form saves to Google Sheets through Google Apps Script.

## Folder structure

```
portfolio/
├── index.html              Main page (all sections)
├── css/
│   └── style.css           All styles
├── js/
│   ├── main.js             Config, mobile menu, contact form, back-to-top
│   └── animation.js        All GSAP motion (preloader, hero, scroll, projects)
├── assets/
│   ├── Sankara_Gomathi_Resume.pdf   ← put your resume here
│   ├── images/                      ← profile photo, icons
│   └── projects/                    ← case study screenshots
├── apps-script/
│   └── Code.gs             Google Apps Script (contact form receiver)
└── README.md
```

## 1. Run locally

No build step is needed.

- **Easiest:** double-click `index.html`.
- **Better (avoids browser quirks):** in VS Code, install the "Live Server" extension and choose *Open with Live Server*.
- **Or** from this folder run `python -m http.server 8000` and open `http://localhost:8000`.

GSAP loads from a CDN, so you need internet access.

## 2. Add your files

| What | Where | How it's used |
|---|---|---|
| Resume PDF | `assets/Sankara_Gomathi_Resume.pdf` | The "Download resume" button |
| Profile photo | `assets/images/profile.jpg` | Uncomment the `<img>` line inside `#profile` in `index.html` |
| Case study screenshots | `assets/projects/` | Replace the `.shot` placeholders with `<img>` tags |

Example for a screenshot:

```html
<div class="shot">
  <img src="assets/projects/cura-hero.png" alt="Cura Care home screen">
</div>
```

Keep the `.shot` wrapper. It gets the reveal animation.

## 3. Google Sheets contact form

1. **Create the sheet.** In Google Sheets, make a new spreadsheet. Rename the first tab to `Messages`. In row 1 add: `Timestamp`, `Name`, `Email`, `Message`.
2. **Copy the Sheet ID.** It's the long string in the URL between `/d/` and `/edit`.
3. **Create the script.** Go to https://script.google.com, click *New project*, delete the default code, and paste the contents of `apps-script/Code.gs`. Set `SHEET_ID` to your Sheet ID.
4. **Deploy.** Click *Deploy → New deployment → Web app*. Set *Execute as: Me* and *Who has access: Anyone*. Click *Deploy*, approve the permissions, and copy the **Web app URL**.
5. **Connect the site.** Open `js/main.js` and paste the URL into `CONFIG.APPS_SCRIPT_URL`.

Test it: open the Web app URL in a browser. You should see `{"ok":true,...}`. Then submit the form on your site and check the sheet.

Note: after changing the script, redeploy with *Deploy → Manage deployments → Edit → New version*. Otherwise the old code keeps running.

## 4. Customising

- **Colours and fonts:** edit the variables at the top of `css/style.css` (`--accent`, `--bg`, `--font-serif`, etc.).
- **Motion:** edit `js/animation.js`. Durations and stagger values are easy to change.
- **Text and content:** edit `index.html`. All content comes from the resume.

## 5. Upload to GitHub

1. Create a new repository on GitHub, for example `portfolio`. Keep it public.
2. Open a terminal inside the `portfolio` folder and run:

```bash
git init
git add .
git commit -m "Initial portfolio"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/portfolio.git
git push -u origin main
```

Or, without the terminal: on the repository page click *Add file → Upload files* and drag the whole folder contents in.

Before pushing, make sure the resume PDF and any photos are inside `assets/`.

## 6. Deploy on Vercel

1. Go to https://vercel.com and sign in with GitHub.
2. Click *Add New → Project*, then *Import* your `portfolio` repository.
3. Leave the settings as they are. This is a static site, so there is no framework preset or build command. Set *Output directory* to `./` if it asks.
4. Click *Deploy*. In about a minute you get a URL like `portfolio-xyz.vercel.app`.

Every time you push to GitHub, Vercel redeploys automatically.

**Custom domain (optional):** in Vercel open *Settings → Domains*, add your domain, and follow the DNS instructions.

## 7. Before you publish: checklist

- [ ] Resume PDF added to `assets/`
- [ ] Apps Script URL pasted into `js/main.js`
- [ ] Test form submission reaches the sheet
- [ ] LinkedIn link checked
- [ ] Case study screenshots added (or placeholders left as they are)
- [ ] Tested on a phone (open the Vercel link on mobile)
- [ ] Tested with *Reduce motion* turned on in your OS settings

## Notes

- Animations turn off automatically when a visitor has *Reduce motion* enabled.
- Mouse-based effects (3D tilt, magnetic buttons, cursor label) only run on devices with a fine pointer, so phones and tablets don't get them.
- The case study numbers come from the resume (for example 85% task completion and 30% fewer navigation steps). Add a source or context before showing them to a recruiter if you have it.
