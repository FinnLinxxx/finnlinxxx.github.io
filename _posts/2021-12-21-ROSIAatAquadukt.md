# ROSIA-Outside aka. NORIA w/ SA T-Scan export

Für ROSIA im Außeneinsatz gelten andere Regeln für die Punktaufnahme und die anschließende Analyse. ROS spielt in diesem Zusammenhang, wenn, nur eine untergeordnete Rolle.
Zum Einsatz kommt das Leica Tachymeter, doch statt über geocom, wird dieses über das normale Captivate Programm am Display bedient. 
Für die Erfassung mit dem Lasertracker wird für die Netzmessung, als auch für die Punktwolkenaufnahme SA verwendet. 

Deswegen wird ROSIA in dienem Zusammenhang umbenannt in NORIA (Not a R Incidence Angle).

Gemessen werden wie gehabt Netzpunkte und Punktwolken. Jedoch nicht mehr streng am Modell entlang, im Bezug auf einen einzelnen Einfallswinkel (IA) die im Labor 
gegenüber einer modellhaften Ebene aufgemacht wird. Sondern im direkt am Objekt, Punkthaft wird der Einfallswinkel ermittelt und mit ähnlichen Zusammen betrachtet.

### Daten Vorbereitung

* In SA: Die Netzpunkte wurden wie gehabt über das Laser Tracker Interface aufgemessen. Die Punktwolken wurden in Verbindung mit TScanCollect über das Leica T-Scan
Interface (in SA) erfasst. Vor dem Export wird zunächst ein Lasertracker-Frame erzeugt (Construct >> Frames >> On Instrument >> Base (select LT, Name: LT_Frame)) >> 
Make Working...>> Transform->Orientation: ZYX Euler Angles Rz: -1.570796327 -> Update. Dann einen TLS-Frame erzeugen (gleiche Prozedur, gleiche Verdrehung eingeben).
Nun die T-Scan Punktwolken exportieren: File >> Export >> Point Clouds (die richtigen auswählen)...Bei "include point labelling" auf "NO".
Für die Transformationsparameter die für die Umwandlung ins PCD Format benötigt werden ($ rosrun igros_rosia rosia_tf.launch) können nun die richtigen Werte 
aus SA ausgelesen werden. Hierfür unter den Frames in SA den TLS (Tachy) Frame als "make Working" setzen, anschließend auf den LT-Frame in der gleichen Leiste einmal
klicken und die Werte unten in der Report Bar auslesen (Translation, Rotation...), diese Werte in Radiant und Meter umgerechnet in das Launch-File eintragen 
(static_transform_publisher für lt2ms50) . Die Reihenfolge im Launch-file betrachten! `xT yT zT zR yR xR [m, rad]`.
Ist der Export der TScanPW abgeschlossen die .txt auf den ROS/Linux Computer zur Berechnung bringen (USB, Netzplatte).
Hier muss die Datei mit zb. vim geöffnet werden, denn es sind noch Header Zeilen darin enthalten die herausgelöscht werden müssen.
In vim nach "\/\" suchen (datei mit n durchgehen).
Dann `$ rosrun igros_rosia transf_scans2pcd /home/finn/PWS_Aquadukt/alles_190721/Messdaten_files/txt/ _ptcl_global_frame:=leica_ms50 _ptcl_local_frame:=lasertracker`
Für die .pts die vom Tachymeter kommt (.sdb zu .pts Transform über Matlab-Converter) `$ rosrun igros_rosia transf_scans2pcd /home/finn/PWS_Aquadukt/alles_190721/Messdaten_files/pts/`
Die entstandenen .pcds in den pcd Ordner tun. Hier müssen diese nun zunächst zurechtgeschnitten werden, zb. mit Cloudcompare).
Aber vorher noch eine visuelle Kontrolle in CloudCompare, ob die Transformation auch wirklich zusammenpasst.

