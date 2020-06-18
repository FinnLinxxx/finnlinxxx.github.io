# After Ubuntu 20.04 installation

First things first
```bash
$ sudo apt update
$ sudo apt upgrade
```

Login into `tunet`-wifi, with `WPA & WPA2 Enterprise`, `Tunneled TLS`, leave the following fields empty and choose No CA 
certificate is required, `MSCHAPv2 (no EAP)`, username for me is flinzer@tuwien.ac.at, my password starts with: ig...


```bash
$ sudo apt install chromium-browser vlc vim terminator krdc blender kdenlive librecad gimp feh htop octave obs-studio obs-plugins cmake git scrot keepassx gparted xrdp nfs-common cifs-utils cloudcompare
```
You may be able to recover more programs if you scan through your old bash_history

Log-in in chromium into google Account

Go into .bashrc and remove numbers from HISTSIZE AND HISTFILESIZE to gain infinite bash_history.
```bash
# for setting history length see HISTSIZE and HISTFILESIZE in bash(1)
HISTSIZE=
HISTFILESIZE=
```

Generate a Public-SSH-Key:
```bash
$ ssh-keygen -t rsa -b 4096 -C "finn.linzer@tuwien.ac.at"
``` 
and send the public part to the geo-it. A password is to be chosen and to save inside my keepass.

--- 
To get a tu-net connection to terminalsservers load the (old) config file into .ssh-folder
```bash
$ ssh -f -N geo-forward
```
Afterwards you are able to connect with krdc, use `rdp:flinzer@localhost:9999`

---
Invite user into groups
```bash
sudo usermod -aG tty dialout cdrom audio video users lpadmin sambashare xrdp docker finn
sudo usermod -aG tty finn
sudo usermod -aG dialout finn
sudo usermod -aG cdrom finn
sudo usermod -aG audio finn
sudo usermod -aG video finn
sudo usermod -aG users finn
sudo usermod -aG lpadmin finn
sudo usermod -aG sambashare finn
sudo usermod -aG xrdp finn
```

--- 
base 16 follow installation guildeline for bash 
https://github.com/chriskempson/base16-shell
and for vim
https://github.com/chriskempson/base16-vim

--- 
samba shares access

add aliases to bashrc

```bash
# Network-Data Mount/uMount
alias fl='sudo mount -t cifs //GEO/Home/staff/flinzer /shares/finn/home -o username=flinzer,uid=finn,gid=finn; cd /shares/finn/home'
alias ufl='cd ~; sudo umount /shares/finn/home'

alias ig='sudo mount -t cifs //GEO/IG /shares/finn/IG -o username=flinzer,uid=finn,gid=finn; cd /shares/finn/IG'
alias uig='cd ~; sudo umount /shares/finn/IG'

alias te='sudo mount -t cifs //GEO/TEACHING /shares/finn/teaching -o username=flinzer,uid=finn,gid=finn; cd /shares/finn/teaching'
alias ute='cd ~; sudo umount /shares/finn/teaching'

alias so='sudo mount -t cifs //GEO/software /shares/finn/software -o username=flinzer,uid=finn,gid=finn; cd /shares/finn/software'
alias uso='cd ~; sudo umount /shares/finn/software'

alias ex='sudo mount -t cifs //GEO/EXCHANGE /shares/finn/exchange -o username=flinzer,uid=finn,gid=finn; cd /shares/finn/exchange'
alias uex='cd ~; sudo umount /shares/finn/exchange'

alias co='sudo mount -t cifs //GEO/COMMON /shares/finn/common -o username=flinzer,uid=finn,gid=finn; cd /shares/finn/common'
alias uco='cd ~; sudo umount /shares/finn/common'

alias flhelp='echo -e "\$fl - flinzer (H:)\n\$ig - ENGINEERING GEODESY (I:)\n\$te - TEACHING (T:)\n\$so - SOFTWARE (S:)\n\$ex - EXCHANGE (X:)\n\$co - COMMON (Q:)"'


```

create folders 
```bash
$ sudo mkdir -p /shares/finn/home
$ sudo mkdir /shares/finn/IG
$ sudo mkdir /shares/finn/teaching
$ sudo mkdir /shares/finn/software
$ sudo mkdir /shares/finn/exchange
$ sudo mkdir /shares/finn/common
```
It does work with DHCP at Freihaus, it may not work properly at Gusshaus.

---
ros

