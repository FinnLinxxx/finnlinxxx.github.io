# Leverarm Bestimmung

## Bestimmung von Näherungswerten mit absoluten Messwerten (aus TScanClient.exe)
Zuerst kann als grobe Näherung für den Leverarm folgende Werte genutzt werden

```bash
$ rosrun tf static_transform_publisher 0.0162 -0.0040 0.3692 -1.032 -0.814 -1.748 tool0_calc tscan_pose_neaherung 300
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
  
 `Zu beachten sind die gewählten Koordinatensysteme!` so zeigt zum Beispiel bei den hier gewählten Daten die HZ=0 Achse des Lasertrackers nicht in Richtung der Y-Achse (Herrstellerdefinition), sondern in Richtung X-Achse. Die angegebene Verdrehung des UR_base-Systems von 0.6108 Radiant ist plausibel, zeigt die Y-Achse nun wie vom Hersteller angegeben in Richtung des Kabelausgangs am Sockel des UR selbst. Für die vollständige integrität des Systems ist dies wichtig, denn nun sind auch die Berechnungen zum tool0 hin über die DH-Parameter und das DH-Skript (forward_kinematic.py) plausibel.
 
 ## Transformation
 
 Um den Roscore zu starten (eventuell Port mit angeben über das -p argument)
 ```bash
 $ roscore
 ```

Nun rviz starten und dort den "ADD" Button klicken, TF auswählen
```bash
$ rosrun rviz rviz
```
Aus der Ausgleichung wissen wir die Beziehung map zu base_link
```bash
$ rosrun tf static_transform_publisher 6.0950 4.4852 -0.6136 0.6108 0.0053 -0.0036 map base_link 300
```
(definition beachten! static_transform_publisher x y z yaw pitch roll frame_id child_frame_id  period)

Aus dem Skript `forward_kinematic.py` oder von ROS selbst wissen wir die Pose tool0 (gegenüber base_link)
z.b. `0.14190628 -0.33053733  0.26661017 -0.42212532  0.5597224  -0.71310662  0.85309395  0.51136504 -0.10361716  0.30666094 -0.65208637 -0.69335592`

Die ersten 3 Werte sind X,Y,Z von tool0 gegenüber base_link, die weiteren 9 Werte beschreiben eine 3x3 Rotationsmatrix, diese kann z.b. in Matlab in eulerwinkel [umgerechnet](https://de.mathworks.com/help/robotics/ref/rotm2eul.html) werden.
`Die Rotationssequenzreihenfolge ist "ZYX" (default), und daher gleich für den static_transform_publisher geeignet'
```matlab
>> rotm = [ -0.42212532  0.5597224  -0.71310662 ; 0.85309395  0.51136504 -0.10361716 ; 0.30666094 -0.65208637 -0.69335592]
>> rotm2eul(rotm)
ans =

    2.0303   -0.3117   -2.3869
```

```bash
$ rosrun tf static_transform_publisher 0.142 -0.3305 0.2666 2.0303 -0.3117 -2.3869 base_link tool0_calc 300
``` 
(eventuell in matlab noch die Genauigkeit mit format longg erhöhen)


Wenn wir jetzt also den Leverarm (Näherung) anbringen, sollte auch dieser plausibel dargestellt werden.
```bash
$ rosrun tf static_transform_publisher 0.0162 -0.0040 0.3692 -1.032 -0.814 -1.748 tool0_calc tscan_pose_neaherung 300
```

Auf diesen Frame (tscan_pose_neaherung) können wir nun mit einem Skript aus dem AKIG Ordner die dort aufgenommene Scanline der T-Scan (T-Scan Zentrisch) anbringen und darstellen. 

Innerhalb dieser Skripte ist die Variable filename_scan entsprechend anzupassen, eventuell auch die Variable die den parent_frame angibt.

(siehe /akig/source/global_tscan_ptcl/publishSingleTScanCenter/publishSinglePtcl.py)
```bash
$ cd akig/source/global_tscan_ptcl/publishSingleTScanCenter
$ ./publishSinglePtcl.py
```

Beim zweiten Skript kann auf das TF Map die LT-Zentrische Punktwolke (unsere Referenz) gemappt werden.
```bash
$ cd akig/source/global_tscan_ptcl/publishSingleLTCenter
$ ./publishSinglePtclLTCenter_matlab.py 
```

Die beiden Punktwolken sollten in rviz näherungsweise übereinander liegen.

