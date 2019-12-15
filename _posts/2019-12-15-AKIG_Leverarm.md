# Leverarm Bestimmung

## Bestimmung von Näherungswerten mit absoluten Messwerten (aus TScanClient.exe)
Zuerst kann als grobe Näherung für den Leverarm folgende Werte genutzt werden

```bash
$ rosrun tf static_transform_publisher 0.014 -0.006 0.373 -1.032 -0.814 -1.748 tool0 tscan_pose_neaherung 300
```
Mit der Annahme, dass das Koordinatensystem wie folgend dargestellt liegt.
![coordsysur5flansch](https://github.com/FinnLinxxx/akig/blob/master/manual/img/coordSysUr5_flansch.png)
Dieser Näherungswert wurde mit Hilfe von der in C++ Programmierbaren Software (source verfügbar) TScanClient.exe und der dort 
verfügbaren Callback-Funktion 6DOF (10hz) erstellt.

Wenn man die dort angegebenen Werte (6DOF) in rviz als TF (/tscan_pose) in ROS darstellt hat man zumindest für eine Roboterarmkonfiguration die absoluten Werte von Map zu T-Scan_Center. Wenn wir nun das Ausgleichsskript bemühen um LT2UR_base zu berechnen und das DH-Parameter Skript benutzen bekommen wir tool0_calc (also tool0 aber berechnet, denkbar wär auch gleich die Werte für tool0 aus ROS zu ziehen). Nun können wir also vom LT ins UR_base System und vom UR_base ins UR-Flansch System rechnen und jeweils ein TF dafür angeben. Die TFs in rviz ermöglichen zusätzlich die Plausibilisierung. Die Beziehung zwischen UR-Flansch System und dem absoluten 6DOF-Wert (Aus TScanClient.exe) können wir nun Abfragen und bekommen den Leverarm für diesen Standort. Dieser muss jetzt noch durch weitere Messungen verifiziert werden.

In Ros TF Beziehungen abfragen über:
```bash
$ rosrun tf tf_monitor /tool0_calc /tscan_pose
```

## Bestimmung Trafo LT zu UR (+Leverarm)

Ich habe die T-Scan auf den Flansch gespannt und das TOP-Prisma.

Die zwei Daten die ich dafür in das Matlab Skript eingeladen habe sehen wie folgt aus:
`tscan_UR_051219_2.txt` aus dem Python Skript MP_server.py

1 5907.163 4051.540 -486.851   1.530    0.110  -2.439

2 5739.369 4115.082 -425.246   1.748   -0.024  -2.671

3 5709.607 4276.248 -191.267   1.589    0.058  -2.664

4 5683.870 4401.022 -292.339   1.603    0.045  -2.037

5 5712.613 4456.521 -546.377   1.470   -0.166  -3.069

6 6148.232 4113.892 -616.878   1.237    0.090  -2.486
...

`tscan_lt_051219_2.txt` aus der Ausgabe von T-ScanClient, könnte aber genausogut aus SA stammen.

1 5907.163 4051.540 -486.851   1.530    0.110  -2.439

2 5739.369 4115.082 -425.246   1.748   -0.024  -2.671

3 5709.607 4276.248 -191.267   1.589    0.058  -2.664

4 5683.870 4401.022 -292.339   1.603    0.045  -2.037

5 5712.613 4456.521 -546.377   1.470   -0.166  -3.069

6 6148.232 4113.892 -616.878   1.237    0.090  -2.486

Ergebnis:

   -0.0036 - rx
   
    0.0053 - ry
    
    0.6108 - rz
    
    6.0950 - dx
    
    4.4852 - dy
    
   -0.6136 - dz
   
    0.0162 - lever_dx
    
   -0.0040 - lever_dy
   
    0.3692 - lever_dz
    
    `Zu beachten sind die gewählten Koordinatensysteme`, sozeigt beispiel
