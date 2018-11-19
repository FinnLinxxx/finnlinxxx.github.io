# TIL_HowTo
Today I learned how to ... (Remembering stuff is hard work)

### Set Intl-US Keyboard Layout
```bash
$ sudo sh -c 'echo "KEYMAP=de-latin1-nodeadkeys" > /etc/vconsole.conf'
```
### ISO Image onto usb stick
```bash
$ sudo dd bs=4M if=ubuntu-18.04.1-desktop-amd64.iso of=/dev/sdb conv=fdatasync status=progress && sync
```

### Activate xbacklight
```bash
$ sudo pacman -S xorg-xbacklight
```

### Screenshot and Screencapture (video) functionality
```bash
$ mkdir -p ~/Media/Screenshots
$ mkdir -p ~/Media/Screencaptures
$ sudo pacman -S xclip vlc maim recordmydesktop
```
> Press: PrtSc, for Screenshot in ~/Media/Screenshots, Choose area

> Screenshots are also available in buffer (Strg + v)

> Press: Shift + PrtSc, for screencapturing in ~/Screencaptures, to STOP Press: Shift + alt + s

### yay as packagemanager
over /var/abs/local 
https://wiki.archlinux.de/title/Arch_User_Repository
https://github.com/Jguer/yay

### Spotify
über yay installiert.
```bash
yay -S spotify
```

### Keymap look-up
```bash
$ sudo pacman -S xorg-xev
```
