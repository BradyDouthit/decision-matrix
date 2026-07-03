# Decision Matrix

A cost vs. usefulness quadrant for prioritizing purchases. Add an item, score it on usefulness and cheapness (0-10 each), and it's plotted on the chart — top-right (cheap + useful) is the best buy.

Runs as a single Node.js server with no build step, data persisted to `data.json` on disk.

## First-time setup on the Pi

```
git clone https://github.com/BradyDouthit/decision-matrix.git
cd decision-matrix
npm install
```

Install it as a systemd service so it survives reboots and auto-restarts on crash:

```
sudo cp deploy/decision-matrix.service /etc/systemd/system/
sudo nano /etc/systemd/system/decision-matrix.service   # replace <username> with your Pi username (check with `whoami`)
sudo systemctl daemon-reload
sudo systemctl enable --now decision-matrix
```

## Accessing the app

From any device on the same wifi:

```
http://raspberrypi.local:3000
```

(`raspberrypi.local` is the default mDNS hostname unless you changed it. If that doesn't resolve, find the Pi's IP with `hostname -I` while logged into it and use `http://<ip>:3000` instead.)

## Pushing updates

1. On your laptop: commit and `git push` as usual
2. SSH into the Pi: `ssh <username>@raspberrypi.local`
3. Pull and restart:
   ```
   cd decision-matrix
   git pull
   npm install   # only needed if package.json changed
   sudo systemctl restart decision-matrix
   sudo systemctl status decision-matrix   # confirm it actually came back up
   ```

`data.json` is gitignored, so `git pull` never touches your saved items.

## Useful commands

```
sudo systemctl status decision-matrix    # is it running?
sudo systemctl restart decision-matrix   # restart after an update
sudo systemctl stop decision-matrix      # stop it
journalctl -u decision-matrix -f         # tail live logs
```

## Troubleshooting

- **Can't SSH in / don't know the username** — the username is whatever you set in Raspberry Pi Imager's advanced options (gear icon) when flashing the SD card. There's no default `pi`/`raspberry` login on current Raspberry Pi OS images. Check with `whoami` once logged in another way, or look at what you set during imaging.
- **Forgot the password** — if you're already logged in (SSH or direct console), change it with `passwd`.
- **`raspberrypi.local` doesn't resolve** — find the IP directly: `hostname -I` on the Pi, then browse to `http://<ip>:3000`.
- **Port already in use / app won't start** — check `journalctl -u decision-matrix -f` for the error, and confirm nothing else is running on port 3000 with `sudo lsof -i :3000`.
