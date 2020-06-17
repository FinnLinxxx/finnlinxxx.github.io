# Einfache Fourieranalyse mit Octave/Matlab

Eine einfache Datenreihe muss vorliegen, die Datenpunkte müssen einem einzigen Kontext entsprechen (zB. Temperaturmessung) und 
vom zeitlichen Abstand her Äquidistant gemessen worden sein oder bereits dahingehend umgerechnet vorliegen.

Zunächst muss diese Datenreihe von systematischen Anteilen befreit werden, zb.: durch Reduktion nach Mittelwert und Trend.

`datarow` sei die Datenreihe (mit n Daten)

```matlab
p = polyfit(1:length(datarow),datarow,1);
```

Anbringen des Mittelwertes (p(2)) und anbringen des Trend (p(1)).
```matlab
datarow = datarow - p(2); 
for i = 1:length(datarow)   
  datarow(i) = datarow(i) - i * p(1);
end
```

Damit das Schema berechnet werden kann ist jetzt noch eine Größe wichtig und zwar in welchem zeitlichen Abstand
die Daten aufgenommen wurden, diese müssen ja wie bereits erläutert äquidistant vorliegen.
```matlab
dt = 10*60 % Zeitintervall zwischen Messungen in Sekunden (zB. 600 Sekunden für 1 Messung alle 10 Minuten)
```

```matlab
Fs = 1/dt; %sampling frequency(Hz)
T = 1/Fs;             % Sampling period  
L = length(datarow);  % Length of signal
t = (0:L-1)*T;        % Time vector
Y = fft(datarow);

%Compute the two-sided spectrum P2. Then compute the single-sided spectrum P1 based on P2 and the even-valued signal length L.
P2 = abs(Y/L);
P1 = P2(1:L/2+1);
P1(2:end-1) = 2*P1(2:end-1);

f = Fs*(0:(L/2))/L;
plot(f,P1) 
title('Single-Sided Amplitude Spectrum of X(t)')
xlabel('f (Hz)')
ylabel('|P1(f)|')

max(P1)
```

FFT suggeriert einen Anteil bei 0.0000117 Hz was etwa 85470 Sekunden
also 1424 Minuten oder fast einem Tag entsprechen würde. Ist ein solcher Peak zu finden, lässt sich dieser einfach erklären, 
da beispielweise Temperaturmessungen natürlich mit dem Tagesverlauf hin- und her schwanken. 
Für andere Einflüsse müssen bei aufdecken ebendieser durch die FFT ebenfalls Interpretationen gefunden werden.

Wir können nur solche Frequenzeinflüsse messen die der halben Gesamt-Messzeit entspricht. Um einen Tagesabhängigen Einfluss zu ermitteln (~1/0.000017) muss demnach mindestens zwei Tage, besser mehr gemessen werden.

Außerdem können maximal Frequenzen ermittelt werden die die halbe Messfrequenz haben (Nyquist-Frequenz). Nehmen wir an wir messen eine größe mit 1000Hz (1000/2), können maximal Frequenzen mit 500Hz festgestellt werden. Nehmen wir an wir messen alle 600 Sekunden, dann entspräche das einer Hertz-Zahl von (1/600) 0.001667 Hz, es können also maximal Frequenzen mit (0.001667/2) 0.00083350 Hz aufgedeckt werden. Die entspräche der doppelten Zeit zwischen zwei Messzeitpunkten, bei 1000Hz eben 0.002 (500 Hz) Sekunden, bei 1/600 Hz (0.001667 Hz) eben 1200 (0.0008333 Hz) Sekunden.

### Matlab Dokumentation
siehe auch: https://de.mathworks.com/help/matlab/ref/fft.html
