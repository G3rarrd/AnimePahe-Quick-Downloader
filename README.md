<h2>
  <img src="screenshots/animepahe_logo_no_bg.png" width="24" height="24" alt="Logo">
  AnimePahe Quick Downloader
</h2>

AnimePahe Quick Downloader is a lightweight browser extension that helps you download episodes from AnimePahe faster and more conveniently.

## Demo

<img src="screenshots/animepahe_quick_downloader_demo.gif" alt="demo_gif">

## Features

- Users can view download options available for their favourite Anime and download it seamlessly 
- Detects episode links and download URLs
- Supports persistent storage on the fetched download options for a limited time.
- Download progress is monitored and reflected on the UI.

## Extension UI Showcase

<table>
  <tr>
    <td align="center" colspan="3">
      <img src="screenshots/homepage_ui.png"><br>
      <b>Homepage</b>
    </td>
  </tr>

  <tr>
    <td align="center">
      <img src="screenshots/extension_on_hover_initial_state.png" width="220"><br>
      <b>On Hover</b>
    </td>
    <td align="center">
      <img src="screenshots/extension_on_dropdown.png" width="220"><br>
      <b>Dropdown</b>
    </td>
    <td align="center">
      <img src="screenshots/download_progressbar.png" width="220"><br>
      <b>Progress Bar</b>
    </td>
  </tr>

  <tr>
    <td align="center">
      <img src="screenshots/download_complete.png" width="220"><br>
      <b>Download Complete</b>
    </td>
    <td align="center">
      <img src="screenshots/download_failed.png" width="220"><br>
      <b>Download Failed</b>
    </td>
  </tr>
</table>


## Installation

1. Open your browser's extension management page.
2. Enable Developer Mode.
3. Load the unpacked extension folder.
4. Make sure the extension files are present in the project root.

## Development

This extension is built using standard web extension files such as:

- `manifest.json`
- `background.js`

And injecting the ui on each anime episode on the animepahe site. Additionally, automation scripts for kwik and pahe are injected when a download option is selected by the user.

## Usage

1. Head over to the AnimePahe homepage or episode page.
2. Hover over an episode you would like to download.
3. Click the view download button to see the available download options for the episode
4. Selet your episode and wait for the download to begin automatically

Note: You will have to solve the cloudflare captcha created by the kwik site once per session for other downloads to work automatically.

## Browser Support
- This extension is only available on the chrome browser as of right now. Future works are for it to work on Mozilla Firefox and others.

## Notes

This project is intended as a browser extension utility for AnimePahe-related downloads. Please respect site terms of service and copyright laws when downloading media.
