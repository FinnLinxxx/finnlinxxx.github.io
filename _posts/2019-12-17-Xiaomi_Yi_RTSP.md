# RTSP Befehle

connect to yi camera via wlan with password.

Open Terminal
```bash
$ telnet 192.168.42.1 7878
```

To get the token Number (default after camera restart: 1)
```
{"msg_id":257,"token":0}
```

Substitude ? with correct token number from previous command.
```
{"msg_id":259,"token":?,"param":"none_force"}
```

Um VLC zu starten und direkt den Stream über UDP weiter schicken (noch auf dem Computer der sich im Wlan der Kamera befindet)
```bash
$ vlc rtsp://@192.168.42.1/live --sout=udp://192.168.178.255:1234
```

Nun kann von VLC auf einem beliebigen anderen Computer im (Geo-Sensor)Netz dieser Stream empfangen werden.
Hierfür Media >> Open Network Stream und dort `udp://@` eingeben. Das war es.
