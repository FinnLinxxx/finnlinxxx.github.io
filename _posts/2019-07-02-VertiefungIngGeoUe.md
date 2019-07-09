Der Übung Ingenieurgeodäsie Vertiefung wird ein Arbeitsaufwand von 1.5 ETCS zugeschrieben, dies entspricht etwa 2.5std/Woche oder ca. 35 Stunden insgesamt. Die ersten beiden Übungen sind relativ aufwändig, die dritte eher medium.

## Vorbesprechung

In der Vorbesprechung geht es zuerst um das gemeinsame kennen lernen. Man kann nachfragen wer schon welche Erfahrungen gemacht hat, außerdem kann ich von meinen eigenen Erfahrungen erzählen. Außerdem sollte die Verknüpfung zur Vorlesungen grob erfolgen. Die Folien aus dem TEACHING Ordner können für eine Einordnung herangezogen werden.

* Gruppeneinteilung, maximal 3 Personen in einer Gruppe, besser 2.

* Den Arbeitsaufwand vorstellen (15/15/8 std.)

* Im Rahmen dieser Übung soll der Übergang geschafft werden, von einfachen Betrachtungsweisen zu einem Ingenieurgeodätischem Verständis, wobei Erfahrungen eine wesentliche Rolle spielen (anders als das Anwenden eines einfachen Zahlenwerks).

* Die Übungen so früh wie möglich ausgeben, damit die Stundenten nicht in den Spätsemesterstress kommen.

* Kommunizieren dass Komunikation das wichtigste ist. Immer per Email, häufig im Büro.

* Literaturarbeit vorstellen: Handbuch Ingenieurgeodäsie Welsch/Heunecke/Kuhlmann Auswertung geodätischer Überwachnungsmessungen (2000) (zB. S.197) oder Auswertung geodätischer Überwachnungsmessungen 2. Auflage, Heunecke/Kuhlmann/welsch/Eichhorn/Neuner (2013).

* Den nächsten Termin unbedingt festlegen

* 

## Wiederholung Ausgleichung

* Darlegung Regression anhand von 2 und n-Punkten.

* Darlegung anhand von Brandstötters Arbeit.

* Darlegung anhand Niemeier (2008) S. 112 Punktbestimmung in der Ebene $$ P_1 und P_2 auf N $$ Die 4 Optionen gegenüber der Gesamtausgleichung.

## Netzplanung

* Bisher bekannt: Überwachung von Einzelpunkten durch Anzielen der evtl. sich bewegenden Punkte, zum Beispiel auf einer Baustelle (Absacken Ubahn Schacht Bau). Vor allem dann eingesetzt wenn **viele Punkte** während einer Kampagne kontrolliert werden sollen. Oder die Überwachung der eignen Station anhand von fest vermarkten Punkten, zum Beispiel auf Staudamm. Dies ist vor allem dann zu empfehlen, wenn die **Genauigkeit** eines Einzelpunktes (Standpunktes) entscheidend ist.

* Neu: Bestimmten mehrer Punkte am Bauwerk (Objektpunkte, "beweglich") und mehrer Standpunkte (Stützpunkte, "fest")

* Die Netzplanung ermöglicht das Evaluieren einer optimalen Konfiguration, um sowohl genau, als auch wirtschaftlich arbeiten zu können. Neben der Genauigkeit spielt auch die Zuverlässigkeit eine große Rolle. Zuverlässig ist ein Netz dann, wenn (grobe) Fehler aufgedeckt werden können und nicht fälschlicherweise als "wahr" angenommen werden.

* Vorstellen: DKM (online-link)[https://www.wien.gv.at/baugk/public/]. "Messwerkzeug" auswählen.

* Vorstellen: Einschränkungen und Betrachtung von möglichen Beobachtungen (mehr ist besser, aber unwirtschaftlich)

* Für Übung 1 eine Teilspurminimierung, die Objektpunkte gehören nicht zum Datum, weil hypothetisch beweglich.

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

Die Durchführung der Strainanalyse ist letztendlich nur das Berechnen eines (eindeutigen) Gleichungssystems. Im 2D-Fall ergeben sich für 3 Punkte 6 Unbekannte. Betrachtet wird u, die Koordinatendifferenz. Eingebracht wird tx,ty als Translation, doch nur damit bekommt man keine (affine) Transformation hierfür berechnet (in Übereinstimmung), erst durch das zusätzlichen Bestimmen der Rotation w, zweier Verzerrungen exx und eyy und einer Scherung exy bzw. eyx wird dies möglich.

$$
u = x_2 - x_1 = (F-I)x_1 + t = dFx_1 + t
$$

$$
u_i = H_ip = \left[ \begin{array}{rr}
x_i & y_1 & 0 & y_1 & 1 & 0 \\
0   & x_i & y_1 & -x_i & 0 & 1  \\
\end{array}\right]  
$$

{% include image.html url="/assets/images/schleuseLubifoto.png" description="Das Schleusenwerk in Uelzen, der baulichen Unterschied beider Schleusen ist deutlich zu erkennen.
" %}



## Nachbesprechung
