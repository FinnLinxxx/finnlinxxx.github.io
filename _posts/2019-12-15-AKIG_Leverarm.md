# Leverarm Bestimmung

Zuerst kann als grobe Näherung für den Leverarm folgende Werte genutzt werden

```bash
$ rosrun tf static_transform_publisher 0.014 -0.006 0.373 -1.032 -0.814 -1.748 tool0_calc tscan_calc 300
```
Mit der Annahme, dass das Koordinatensystem wie folgend dargestellt liegt.
![coordsysur5flansch](https://github.com/FinnLinxxx/akig/blob/master/manual/img/coordSysUr5_flansch.png)
Dieser Näherungswert wurde mit Hilfe von der in C++ Programmierbaren Software (source verfügbar) TScanClient.exe und der dort 
verfügbaren Callback-Funktion 6DOF (10hz) erstellt.

[Erklärung dafür hier einfügen]


