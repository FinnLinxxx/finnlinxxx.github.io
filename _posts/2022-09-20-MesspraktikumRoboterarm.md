Den Tracker 30 Minuten vor Start einschalten um den Laser einzuheizen. Daran denken, dass die T-Probe geladen ist.
Die T-Probe wird auf dem Schnellspannersystem mit Kabelbinder und Heißkleber festgemacht und vorerst nicht auf dem Roboterarm gebracht.
Den Roboterarm einschalten, immer an die Schwerpunkt+Kilogramm Angabe achten. Für die T-Probe mit Schnellspanner nachher hat es gereicht keinen Schwerpunkt, aber 1.1 Kg 
anzugeben.

Wenn der Tracker hochgefahren ist SA öffnen und sofort auf mm, Celsius, Radians umstellen.
SA Projekt speichern.
Instrument >> Add >> (LTD 800)
Instrument >> Run Interface Module >> Lasertracker.

Wir erzeugen erstmal ein Frame der im Lasertracker drinnen liegt.
Construct >> Frames >> On Instrument >> Base (nur einen Namen vergeben und direkt auf "Make working" klicken)

Die T-Probe einschalten und vom Lasertracker fangen lassen und in Ruhe legen. Nach ein paar Sekunden sollte das Interface erkannt haben, dass eine T-Probe im 
Strahlengang liegt (wird bei Measure: und Home: angeben ...005058...)

Jetzt kann mit der T-Probe gemessen werden. 
Wir messen einige Punkte auf jeder der 3 Ebenen die zu einer Ecke am Roboterarmtisch gehören (3 Gruppen á einiger Punkte pro Ebene in SA).
Anschließen kann in SA mit
Construct >> Planes >> Fit to Points >> F2 (Die passende Gruppe aussuchen und benennen) 
eine Ebene gesetzt werden. "Measured side for offset" und "Planar Offset direction" eventuell anpassen (visuell die Lager Punkte und der neuen Ebene in SA prüfen)

Jetzt ein neues Koordinatensystem setzen.
Construct >> Frames >> 3 Planes (die drei zuvor erzeugten Planes auswählen, darauf achten, dass mindestens die Z-Plane in der Ebene liegt). Hier noch angeben, dass der
neue Frame einen "Z Value on Plane" von 200 mm bekommt (siehe Aufgabenstellung), dem Frame einen passenden Namen geben.

--- 

Nun müssen wir das Programm fahren um mit Hilfe des Matlab-Tools die Lage des Roboterarms und des Leverarms (der T-Probe) im Raum zu bestimmen.
Die T-Probe nun auf den Flansh geben.

Wir benötigen SA zur Punktmessung der T-Probe und das Programm MP_Server.py von Sabine (siehe auch Gitlab) um die Roboterstellwinkel aufzunehmen (für das Matlab Skript später) (python muss installiert sein).

Nun ein cmd in Windows öffnen und zum MP_Server.py Programm navigieren, dann `> python MP_Server.py` 
Nun wartet das Programm auf eine Socket verbindung zum Roboterarm. Auf dem Roboterarm (also dem Tablet) auf File >> Load Programm >> MP_clientFile.py (und hier auf Play).
Die Verbindung sollte nun stehen, wenn nicht dann eventuell IP und SOCKET Adressen vom MP_Server.py und MP_clientFile.py [siehe foto] anpassen (sollte sein wie mit
`> ipconfig`.

Jetzt immer abwechselnd auf dem UR-Tablet continue [siehe foto] drücken, wenn eine Roboterpose aufgenommen werden soll. Direkt wenn man auf dem Tablet das gedrückt hat kann man in SA eine Punkt-Messung für die T-Probe auslösen. Dies sollte in einer neuen eigenen Gruppe passieren die mit der Nummer 1 startet.
Wenn erneut das Continue auf dem Tablet erscheint [siehe foto zuvor] kann der Roboterarm frei beweglich an eine neue Stelle verfahren werden, darauf achten, dass die Pose immer auch vom Tracker gefangen bleibt.

Ist man Fertig kann man da SA Projekt speichern und dort diese eine Gruppe mit Rechtsklick und dann >> Export to ascii File >> Save (Point, no boxes checked, Cartesian, Space, Fixed at 6 (nothing else checked)) speichern.

Die Werte vom Roboterarm wurden automatisch an den Ort gespeichert an dem auch die Datei MP_Server.py liegt. Es ist das 191117_pose.txt file (oder ähnlich)
```txt
191117_pose.txt

1,-0.41932,-0.17720,0.65179,-0.41550,-1.23826,0.25847
2,-0.28887,-0.49526,0.40679,0.08517,-1.58912,0.16353
3,-0.01333,-0.30160,0.79018,-0.46426,-1.59409,1.44285
4,-0.28123,-0.03048,0.89878,-0.84026,-1.50782,0.82909
...
```


```txt
ascii_aus_sa.txt

1   474.800691   -6181.091276   -25.172001
2   138.238794   -6261.261545   -230.665013
3   173.403140   -6531.884273   21.075666
4   537.582579   -6320.914070   123.711399
...
```

Jetzt Matlab öffnen (ur_lt_matlab projekt auf Github): apply_trafo_leverarm.m und data_add-leverarm-to-RF/data_trafo_TTH2.m

Wichtig: - Das ganze wurde unter Windows verwendet (unter Linux würde es auch gehen, allerdings müsste man dann alle Pfade anpassen, ist easy).
                - apply_trafo_leverarm.m müsste sich problemlos durchführen lassen (mit den derzeit benannten und vorhandenen Daten)
                - data_trafo_TTH2.m enthält wie in der readme beschrieben ist die Daten (hier juri_RIGHT.txt und lt_RIGHT.txt, das RIGHT bezieht sich auf die Messung damals die auf das rechte Prisma der T-Scan gezielt hatte). 
                - Schau dir die Datenformate von juri_RIGHT.txt und lt_RIGHT.txt, genau so brauchen wir dies auch. Die lt Daten bekommen wir über SA und die Roboter (juri) Daten aus der MP_Server.py Programm (auch im Anhang) wie wir es auch in AKIG verwendet hatten. 

191117_pose.txt und ascii_aus_sa.txt mit in den data_add-leverarm-to-RF Ordner legen und im Skript data_trafo_TTH2.m entsprechend benennen.
In der Zeile MV = [4 156 80]x1e-03; müssen die Näherungswerte angegeben werden, diese hier passen gut für die T-Probe [siehe Foto].

Evtl. in den Zeilen 79 von data_trafo_TTH2.m (Cll_R) noch die A-Priori Werte ändern, sodass der Globaltest aufgeht (der Wert liegt so bei 0.65 oder 0.2 mm Genauigkeit).

Das sollte jetzt durchrattern und am Ende sollten da 9 Werte stehen (>> adj.x und adj.stdX für Standardabweichungen).
Die ersten drei: Orientung/Verdrehung LT zu UR
Die zweiten drei: Translation LT zu UR
Die dritten drei: Translation UR-Flansch zu Rubinkugel (in diesem Fall).

---

Diese Werte bringen wir nun in SA an.
Construct >> Frames >> On Instrument >> Base (Name: UR_Frame, dieser liegt nun exakt im LT_Frame).
Dann drauf rechtsklick >> Properties >> Make Working (dann) >> Transform zb.
  (Cartesian XYZ) 471.400000  -6668.700000  -635.300000  (ZYX Euler Angles) -1.6169   0.0041    0.0040 (aus dem Matlab Skript, wenn man es genauer haben will muss man in Matlab mehr Nachkommastellen ausgeben)  >> Update
  
  Der neue Frame sollte nun plausibel in SA visualisert sein (Z- nach oben zeigend).
  
  --- 
  
  Jetzt zum Robotertablet gehen [siehe Fotostrecke]
  
  
