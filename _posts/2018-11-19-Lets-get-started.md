# TIL_HowTo
Today I learned how to ... (Remembering stuff is hard work)

### Set Intl-US Keyboard Layout
```bash
$ sudo sh -c 'echo "KEYMAP=de-latin1-nodeadkeys" > /etc/vconsole.conf'
$ export LC_ALL="en_US" (to get Umlaute (debug option))
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
$ yay -S spotify
$ sudo pacman -S playerctl
```

### Remember Password Git 
```bash
$ git config --global credential.helper 'cache --timeout=3600'
```
> Remember Credentials for 3600 seconds (1hour)

### Keymap look-up
```bash
$ sudo pacman -S xorg-xev
$ xev
```

<!-- begin wwww.htmlcommentbox.com -->
 <div id="HCB_comment_box"><a href="http://www.htmlcommentbox.com">HTML Guestbook</a> is loading comments...</div>
 <link rel="stylesheet" type="text/css" href="//www.htmlcommentbox.com/static/skins/bootstrap/twitter-bootstrap.css?v=0" />
 <script type="text/javascript" id="hcb"> /*<!--*/ if(!window.hcb_user){hcb_user={comments_header:'Guestbook'};} (function(){var s=document.createElement("script"), l=hcb_user.PAGE || (""+window.location).replace(/'/g,"%27"), h="//www.htmlcommentbox.com";s.setAttribute("type","text/javascript");s.setAttribute("src", h+"/jread?page="+encodeURIComponent(l).replace("+","%2B")+"&opts=16862&num=10&ts=1543097650597");if (typeof s!="undefined") document.getElementsByTagName("head")[0].appendChild(s);})(); /*-->*/ </script>
<!-- end www.htmlcommentbox.com -->

### zsh
```bash

$ sudo pacman -S zsh
$ chsh (change shell)
pw
/bin/zsh

$ sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
from website https://github.com/robbyrussell/oh-my-zsh (thats it)

$ vim .zshrc
ys theme
https://github.com/chriskempson/base16-shell
include configuration again
