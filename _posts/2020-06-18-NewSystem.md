# After Ubuntu 20.04 installation

Login into `tunet`-wifi, with `WPA & WPA2 Enterprise`, `Tunneled TLS`, leave the following fields empty and choose No CA 
certificate is required, `MSCHAPv2 (no EAP)`, username for me is flinzer@tuwien.ac.at, my password starts with: ig...


```bash
$ sudo apt install chromium-browser vlc vim terminator krdc blender kdenlive librecad gimp feh htop octave obs-studio obs-plugins cmake git scrot keepassx gparted xrdp
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
