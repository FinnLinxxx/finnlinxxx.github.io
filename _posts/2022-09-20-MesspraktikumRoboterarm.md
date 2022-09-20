a

Den Tracker 30 Minuten vor Start einschalten um den Laser einzuheizen. Daran denken, dass die T-Probe geladen ist.
Die T-Probe wird auf dem Schnellspannersystem mit Kabelbinder und Heißkleber festgemacht und vorerst nicht auf dem Roboterarm gebracht.
Den Roboterarm einschalten, immer an die Schwerpunkt+Kilogramm Angabe achten. Für die T-Probe mit Schnellspanner nachher hat es gereicht keinen Schwerpunkt, aber 1.1 Kg 
anzugeben.

Wenn der Tracker hochgefahren ist SA öffnen und sofort auf mm, Celsius, Radians umstellen.
SA Projekt speichern.
Instrument >> Add >> (LTD 800)
Instrument >> Run Interface Module >> Lasertracker.

Wir erzeugen erstmal ein Frame der im Lasertracker drinnen liegt.
Construct >> Frames >> On Instrument >> Base (nur einen Namen vergeben und direkt auf "Make working" klicken.

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

