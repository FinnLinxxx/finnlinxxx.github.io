# ROSIA-Outside aka. NORIA w/ SA T-Scan export

Für ROSIA im Außeneinsatz gelten andere Regeln für die Punktaufnahme und die anschließende Analyse. ROS spielt in diesem Zusammenhang, wenn, nur eine untergeordnete Rolle.
Zum Einsatz kommt das Leica Tachymeter, doch statt über geocom, wird dieses über das normale Captivate Programm am Display bedient. 
Für die Erfassung mit dem Lasertracker wird für die Netzmessung, als auch für die Punktwolkenaufnahme SA verwendet. 

Deswegen wird ROSIA in dienem Zusammenhang umbenannt in NORIA (Not a Ros Incidence Angle).

Gemessen werden wie gehabt Netzpunkte und Punktwolken. Jedoch nicht mehr streng am Modell entlang, im Bezug auf einen einzelnen Einfallswinkel (IA) die im Labor 
gegenüber einer modellhaften Ebene aufgemacht wird. Sondern im direkt am Objekt, Punkthaft wird der Einfallswinkel ermittelt und mit ähnlichen Zusammen betrachtet.

### Daten Vorbereitung

* In SA: Die Netzpunkte wurden wie gehabt über das Laser Tracker Interface aufgemessen. Die Punktwolken wurden in Verbindung mit TScanCollect über das Leica T-Scan Interface (in SA) erfasst. Vor dem Export wird zunächst ein Lasertracker-Frame erzeugt (Construct >> Frames >> On Instrument >> Base (select LT, Name: LT_Frame)) >> Make Working...>> Transform->Orientation: ZYX Euler Angles Rz: -1.570796327 [rad] -> Update. Dann einen TLS-Frame erzeugen (gleiche Prozedur, gleiche Verdrehung eingeben).

* Nun die T-Scan Punktwolken exportieren: Zunächst wieder den LT-Frame als "make working" setzen, dann File >> Export >> Point Clouds (die richtigen auswählen)...Bei "include point labelling" auf "NO".

* Für die Transformationsparameter die für die Umwandlung ins PCD Format benötigt werden ($ rosrun igros_rosia rosia_tf.launch) können nun die richtigen Werte 
aus SA ausgelesen werden. Hierfür unter den Frames in SA den TLS (Tachy) Frame als "Make Working" setzen, anschließend auf den LT-Frame in der gleichen Leiste einmal klicken und die Werte unten in der Report Bar auslesen (Translation, Rotation...), diese Werte in Radiant und Meter umgerechnet in das Launch-File eintragen 
(static_transform_publisher für lt2ms50) . Die Reihenfolge im Launch-file betrachten! `xT yT zT zR yR xR [m, rad]`.

Ist der Export der TScanPW abgeschlossen die .txt auf den ROS/Linux Computer zur Berechnung bringen (USB, Netzplatte).

Hier muss die Datei mit zb. vim geöffnet werden, denn es sind noch Header Zeilen bzw. Störungen darin enthalten die herausgelöscht werden müssen.
In vim nach "/\/" suchen (datei mit n durchgehen und mit :wq speichern).

```bash
$ cd /home/finn/workspace_rosia/src/igros_rosia/launch
$ vim rosia_tf.launch
(dort static_transform_publisher für lt2ms50) . Die Reihenfolge im Launch-file betrachten! `xT yT zT zR yR xR [m, rad]`.
$ source ~/workspace_rosia/devel/setup.bash 
$ roslaunch igros_rosia rosia_tf.launch
```

Dann `$ rosrun igros_rosia transf_scans2pcd /home/finn/PWS_Aquadukt/alles_190721/Messdaten_files/txt/ _ptcl_global_frame:=leica_ms50 _ptcl_local_frame:=lasertracker`

Für die .pts die vom Tachymeter kommt (.sdb zu .pts Transform über Matlab-Converter) `$ rosrun igros_rosia transf_scans2pcd /home/finn/PWS_Aquadukt/alles_190721/Messdaten_files/pts/`

Die entstandenen .pcds in den pcd Ordner tun. Hier müssen diese nun zunächst zurechtgeschnitten werden, zb. mit Cloudcompare).
Aber vorher noch eine visuelle Kontrolle in CloudCompare, ob die Transformation auch wirklich zusammenpasst.

Hier nun die T-Scan und MS50/MS60 Punktwolke zusammen so zuschneiden, dass nur überlappende Bereiche übrig bleiben.
Die MS50/MS60 Punktwolke abspeichern im "ASCII cloud" Format, Benennen nach einem passenden Dummynamen, zb. "ms50_p1.0_gon.pcd" (obwohl als ascii-Format exportiert, muss die .pcd Endung erhalten bleiben), in den Save-Setting, Coord.-Prec.: 8, Scal.-Prec.:8, space, [ASC] point, color, SF(s), normal, und keine Häkchen setzen. Anschließend mit selben Einstellungen aber mit dem DummyNamen "tscan_p1.0_gon.pcd" die T-Scan Punktwolke exportieren. Das für weitere Bereiche unter hochzählen des Dummynamens weiter machen. 

Die ms50 Dateien nun in den ms50 Ordner, die tscan dateien (.pcd) in den tscan Ordner. Nun kann in Jupyter-Notebook das ganze Berechnet werden, was aufgrund der Punktwolkegröße etwas dauern kann.


Wichtig ist, dass ich in den Zeilen 
```python
    for element_in_nn_yield in overshot_nn_yield[:,2]:
        if (element_in_nn_yield > (0.00000157*5)): #Hz und V zusammenaddiert (dist) 
            del_i.append(i)
        i = i + 1
```
die maximal Zulässige Winkelabweichung erhöht habe (um 5 oder so). Weil wir näher dran stehen musst dieser geöffnet werden, da wir ansonsten zu wenig Punktpaare zurück bekommen.



