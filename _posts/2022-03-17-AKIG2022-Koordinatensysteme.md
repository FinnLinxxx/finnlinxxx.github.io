Koordinatentransformationen:

* Vom gegebenen Koordinatensystem (zb. Geodätisch) ggf. in ein rechtshändisches. Y Koordinaten zeigen nach Norden, X Koordinaten nach Osten, Z Koordinaten nach oben
* Der Ursprung von /map kann in diesem Koordinatensystem liegen (y Norden, X Osten, Z oben).
* Die 0-Richtung von Messsystemen liegt in positiver X Richtung, positive Y Koordinaten liegen Links davon, Z zeigt nach oben. Dies gilt für Odom/Scan/Tachy/...



# Tachymeter_geocom Interface

Das Tachymeter published (noch) falsch

```cpp
       case 0: { 

        dHz = valuesFromTachy.at(1);
        dVz = valuesFromTachy.at(2);
        ddist = valuesFromTachy.at(3);
        std::cout << "dHz: " << dHz << "	dVz: " << dVz << "		ddist: " << ddist << std::endl;
        std::vector<double> newCoordinates = calculateKartesianCoordiantes(dHz, dVz, ddist);
        //TODO(linzer): Evaluate coorect transformation situation
        tachy_meas.point.x = -1*newCoordinates.at(0);
        tachy_meas.point.y = newCoordinates.at(1);
        tachy_meas.point.z = newCoordinates.at(2);
        std::cout << "dX: " << tachy_meas.point.x << "	dY: " << tachy_meas.point.y << "		dZ: " << tachy_meas.point.z << std::endl;
        ...
```
