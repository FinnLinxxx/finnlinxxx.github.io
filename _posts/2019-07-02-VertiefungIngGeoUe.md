## Vorbesprechung

In der Vorbesprechung geht es zuerst um das gemeinsame kennen lernen. Man kann nachfragen wer schon welche Erfahrungen gemacht hat, außerdem kann ich von meinen eigenen Erfahrungen erzählen. Außerdem sollte die Verknüpfung zur Vorlesungen grob erfolgen. Die Folien aus dem TEACHING Ordner können für eine Einordnung herangezogen werden.

* Dies ist ein Bullet Point
* Dies auch

## Wiederholung Ausgleichung

* Darlegung Regression anhand von 2 und n-Punkten.

## Netzplanung


## Aufgabenstellung

Am [Aquädukt Mauer](https://www.google.de/maps/place/Aqu%C3%A4dukt+Mauer/@48.1467942,16.2804054,217a,35y,332.44h,42.2t/data=!3m1!1e3!4m5!3m4!1s0x476da7a0a0883c2f:0xe9f67ac66c54cf60!8m2!3d48.1483008!4d16.2795108?hl=de), einem historischen Bauwerk im 23. Wiener Bezirk, soll zur Detektion von Veränderungen ein geodätisches Netz derart geplant
werden, dass die Genauigkeit von 4 Objektpunkten (Z1-Z4) in einem Konfidenzintervall mit unter 2 mm (95% - Sicherheitswahrscheinlichkeit)
bestimmt werden kann. Das zur Verfügung stehende Instrument ist eine Totalstation [Leica TCRP 1201](http://www.kankou.co.jp/en/kumonos/downloads/Leica_TPS1200+.pdf)

(σR = 0.3 mgon, σS = 2 mm + 2 ppm, weitere Einflüsse beachten). 

{% include image.html url="/assets/images/AquM.png" description=" Übersicht des Messobjekts aus Google Maps und die Bereiche der Objektpunkte angedeutet
" %}

Die möglichen Sichtverbindungen für das Netz sind der Tabelle zu entnehmen

{% include image.html url="/assets/images/sichtverbindungenUe1.png" description="Die möglichen Sichtverbindungen der Standpunkte (1-11) und Objektpunkte (Z1-Z4)
" %}

Die simulierten angenommenen Koordinaten kann aus den angegeben Bereichen im DKM abgelesen werden.



## Kongruenzprüfung und Lokalisierung

---
### Erster Termin

---
### Zweiter Termin

* Tafelbild, Gaußkurve 1σ, 2σ, 3σ, grober Fehler? Wie Einordnen, heruntergewichten oder rausschmeißen. Eine Info ist immer noch eine Info, wenn auch weniger Präzise, außer grober Fehler! Bei 100 Beobachtungen ist bei 3σ von einem vermeintlichen Ausreißer sogar auszugehen, das deutlich machen.

* Besprechung der letzen Woche und eingehen aufs Video. Ausgleichen Hz, Vz, D -> AtPA

* Zusammenbringen der theoretischen Standardabweichung σ0 (apriori) mit der Standardabweichung der Gewichtseinheit nach der Ausgleichung S0 (aposteriori). Warum nicht genau 1=1 treffen nötig (overfitting)? 

* Gewichten und Ausgleichen, was machen wir da? (AbsGlied, StdAbw). Ein grober Fehler l_i wird hauptsächlich v_i beeinflussen. Daher betrachten wir die Normierte Verbesserung (NV).

* Beurteilen der Beobachtungen nach der NV (<2.5 nicht erkennbar, 2.5-4 möglich, > 4 Wahrscheinlich).

* Data-Snooping nach Baarda + Kritik

* Beurteilen nach Globaltest, NV, Genauigkeit der ausgeglichenen Punkte.

* Globaltest: apriori ca.= aposteriori, nur wenn 1. Keine groben Fehler (siehe NV) 2. Stochastisches Modell (Erfahrungen, ist anpassen) 3. Funktionales Modell (Für unseren Zweck mit Panda erprobt, sonst durchaus möglich wenn systematik ungenügend)

* Genauigkeiten geben in der Ausgleichung das Ziel vor: wenn klein genug + Globaltest + NV klein. Ggf. mehrere Iterationen nötig.

* Zeigen wie man in PANDA ausgleicht anhand der gemessenen BASIS im Keller mit DefoAn und RV-Strategie.

* Warum wir von gleichen Näherungskoordianten aus Ausgleichen müssen!

* Siehe Aufgabenstellung. Vorgehen insgesamt: 1. Näherungskoordinaten erzeugen, erst grob, dann durch iteration angepasst 2. Ausgleichen Epoche1 3. Ausgleichen Epoche2 4. Deformationsanalyse (5. Koordinatenvergleich). 

* Anfangen der Ausgleichung Aquädukt, begleiten der Studenten bis erste erfolgt. Hinweis für Standpunkt 1 geben und erläutern warum. 

* Tafelbild alle vorrausetzungen: ident. Punktbezeichnung, gleicher Datumsdefekt, gleiche Näherungskoordinaten, aprio ca.= apost, 2 stufige Analyse (Sützpunkte/Objektpunkte.


---
### Bewertung Bericht 2

**4 Punkte** können für die Betrachtung der Ausgleichung erreicht werden (siehe Bewertungsschma Exceltabelle). (max 4) Punkte gibts für folgende Betrachtungen:

* Näherungskoordinaten müssen iteriert werden, damit die Ausgleichung passt.

* Begründung des Modells, der Kongruenz zweier Epochen

* Objektpunkte genauer 2 mm in jeder Epoche

* Stoachstische Betrachtung (Argumentation und letztendliche Festlegung Apriori) begründen.

* Erwähung des mathematischen Modells

Für den Globaltest gibt es **einen Punkt**, wenn dieser in beiden Epochen bei apriori und ca. aposteriori nahe 1 liegt.

## Strainanalyse

{% include image.html url="/assets/images/schleuseLubifoto.png" description="Das Schleusenwerk in Uelzen, der baulichen Unterschied beider Schleusen ist deutlich zu erkennen.
" %}


## Nachbesprechung
