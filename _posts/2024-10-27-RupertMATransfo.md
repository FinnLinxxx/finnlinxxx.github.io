# Project Description: Calculation and Monte Carlo Simulation of Transformation Parameters

This project is structured into two main folders:
- **`calc`**: Contains the algorithm to calculate transformation parameters and perform Monte Carlo simulations.
- **`data`**: Holds the necessary data for transformation calculations and simulations, organized by campaign and epoch.

## Data Structure (`data` folder)

The raw data is stored in the `data` folder, organized by project and epoch. For instance, for the project **MS60_Klinker** and epoch **Netz11082021**:

```bash
$ cd /myProjectFolder/data/MS60_Klinker/Netz11082021
```

This folder contains data from both the Total Station and the Laser Tracker, serving as measurement bases and references. Additionally, it includes transformation parameters provided by both software calculations (SA) and self-computed values (GHHT).

- **Total Station Data: `tachymeter.txt`**
  - This file contains measurements from the Total Station in two layers:
```txt
41                373.34920  121.48744    3.44285   
41                173.34537  278.51157    3.44295   
43                 52.94755   89.80689    4.74597   
43                252.94952  310.19130    4.74607   
31                389.91568   93.54644   10.18945   
31                189.91685  306.44996   10.18945   
23                 14.96134   97.08293   16.84965 
... (jeweils zwei Lagen)
```

- **Reference Data: `LTnet_inLT.txt`**
  - Measurement data from the Laser Tracker in its own coordinate frame:
```txt
41   3833.86871814   1945.04506560   -1051.07497328   19.05000000   19.05000000    08/11/21 13:21:26      Leica emScon 1339   Reflector 'CCR-1.5in' ADM Offset = 0.000000 mm   Target 'SMR: CCR-1.5in'   RMS Error 0.013101 mm   Weather:T=22.8C,P=998.2hPA(mbar),H=55.6%   Precise Pt   Controller sample time=5.000000 sec, samples~5000   std components: 1 = 0.002540, 2 = 0.001635, 3 = 0.000000 mm
43   3917.66888680   -2835.09319047   862.38759633   19.05000000   19.05000000    08/11/21 13:25:08      Leica emScon 1339   Reflector 'CCR-1.5in' ADM Offset = 0.000000 mm   Target 'SMR: CCR-1.5in'   RMS Error 0.011252 mm   Weather:T=22.8C,P=998.2hPA(mbar),H=55.6%   Precise Pt   Controller sample time=5.000000 sec, samples~5000   std components: 1 = 0.001510, 2 = 0.001743, 3 = 0.000000 mm
31   10894.25547562   2059.63572780   1074.35616496   19.05000000   19.05000000    08/11/21 13:28:56      Leica emScon 1339   Reflector 'CCR-1.5in' ADM Offset = 0.000000 mm   Target 'SMR: CCR-1.5in'   RMS Error 0.027785 mm   Weather:T=22.8C,P=998.2hPA(mbar),H=55.6%   Precise Pt   Controller sample time=5.000000 sec, samples~5000   std components: 1 = 0.002116, 2 = 0.001337, 3 = 0.000000 mm
... (so exportiert aus SA im Lasertracker_Frame)
```

- **Result Files**:
  - **`LT2TLS_SA.txt`**: Transformation between frames, exported from the software (SA):
```txt
Frame
A::LT_Frame
	X	Y	Z
Translation (mm)	720.72640733	-823.64912735	-120.73830024
Rotation (rad)	0.00358155	-0.00641389	1.59509516
X Axis	-0.02429594	0.99968424	0.00641384
Y Axis	-0.99969783	-0.02431925	0.00358147
Z Axis	0.00373632	-0.00632489	0.99997302
Proj. Ang.	Rx from Y	Ry from Z	Rz from X
X (rad)	0.00641578	-1.31269622	1.59509516
Y (rad)	2.99537464	-1.56721379	-3.11727085
Z (rad)	1.57712130	0.00373640	-1.03721859
```

  - **`LT2TLS_GHHT.txt`**: Transformation result from the in-house Gauss-Helmert adjustment.
```txt
Translation [mm]	720.75577154	-823.70918214	-120.71929400
Rotation [rad]	0.00358357	-0.00641302	1.59509765
```
---

## Algorithm Structure (`calc` folder)

The `calc` folder contains the main calculation logic:

```bash
calc/
├── mc/
├── network/
├── __pycache__/
├── README.md
├── sources/
├── ts.py
└── venv/
```

### Explanation of Key Files and Folders:

1. **`mc/`** - Monte Carlo Simulation
   - **`mcs.py`**: This is the main script for the Monte Carlo simulation, calculating uncertainties for the transformation parameters. It utilizes the `nwlsa.py` module (network adjustment) and `lsa.py` module (least squares adjustment) to perform simulations and store the results in `LT2TLS_GHHT.txt`. Both `nwlsa.py` and `lsa.py` are integral for Monte Carlo runs.
     - **Parameters**:
       - `n`: Number of Monte Carlo runs for the simulation (e.g., `n=5000`).
       - `vaco`: Variance components affecting the accuracy of the adjustments (e.g., `vaco = np.array([1.24, 1.65, 0.68, 1.28, 1.33, 1.16])`).
       - `what_to_do`: Process option for either calculation or loading existing data (e.g., `what_to_do = 'calc'`).
     - **Note**: For purely calculating the transformation parameters without simulation, use the basic `__main__` section at the bottom of the script.

   - **`nwlsa.py`**: Implements the `NWAdjustment` class for network adjustment using the Gauss-Helmert method. This file relies on `lsa.py` for statistical calculations.
   - **`lsa.py`**: Provides the fundamental `LSAdjustment` class, enabling least squares adjustments and variance component analyses. This class is used by `nwlsa.py` to compute residuals and parameters for each adjustment.

2. **`network/`** - Independent Transformation Scripts
   - **`ghht.py` (Gauss-Helmert Transformation)**: Implements the Gauss-Helmert transformation, a precise iterative adjustment method. It operates independently and can generate transformation parameters directly.
   - **`wsst.py` (Weighted Similarity Transformation)**: Provides a basic weighted transformation method without further extensions.
   - **`wsstx.py` (Extended Weighted Similarity Transformation)**: Expands on the weighted transformation, potentially including refined conditions or additional scaling factors.
   - These three scripts do not interact with each other or with the `mc` folder, allowing independent runs for specific transformation needs.

3. **`ts.py`** - Transformation Support Script
   - This script provides auxiliary functions and data types supporting the calculations in the Monte Carlo simulation in `mcs.py`.

4. **README.md** - Project Documentation
   - This file should include instructions on how to set up, run, and use the project effectively, as well as any prerequisites.

5. **Sources** - Visual Aids
   - Contains images or other resources to help illustrate the calculation processes but does not directly affect the code functionality.

---

## Important Parameters in `mcs.py`

Several key parameters in `mcs.py` can be adjusted to customize the Monte Carlo simulations and transformation calculations:

- **Number of Simulations (`n`)**: Sets the number of Monte Carlo runs, allowing for more accurate uncertainty estimates with higher values.
- **Variance Components (`vaco`)**: These empirically determined values affect the accuracy of the adjustments.
- **Campaign and Epoch Information (`cmp` and `epo`)**: Determines which datasets are loaded for the calculations.

---

## Best Practices for Running the Project

1. **Data Preparation**: Ensure the correct data structure is in place, with campaign and epoch information accurately reflected in the `data` folder.

2. **Setting Parameters**: Adjust the `n` and `vaco` parameters in `mcs.py` to achieve the desired balance of accuracy and runtime. Verify the paths to input and output files (e.g., `LT2TLS_GHHT.txt`) to avoid overwriting data unintentionally.

3. **Independent Testing of Scripts**: `mcs.py`, `ghht.py`, and `wsst.py` can each be run independently depending on the specific transformation needs. Use `mcs.py` for comprehensive uncertainty analysis and `ghht.py` or `wsst.py` for simpler transformation computations.

4. **Output Verification**: For `mcs.py`, note that the final transformation parameters may differ slightly from `ghht.py` results due to averaging in the Monte Carlo process.

---

## Developer Notes

Here’s an important message from the developer about the project structure and best practices for reproduction:

> The most elaborate algorithm is under `mc > mcs.py`, where there’s a basic `__main__` section at the end for purely calculating transformation parameters. The original model in `ghht.py` was hard-coded; however, `mcs.py` implements this in classes and functions. The core adjustment models (Gauss-Markov, Gauss-Helmert) are in `lsa.py`, while the network adjustment builds on this in `nwlsa.py`.
>
> For more accurate reproduction, pay attention to:
> - Setting variance components correctly (either all to 1 or preserving current values).
> - Deciding whether to estimate scale for LT distance.
> - Excluding points based on stricter averaging thresholds for Total Station measurements.

---

## Conclusion

This project setup allows for high flexibility in calculating and simulating transformation parameters, with options for both detailed Monte Carlo analysis and simpler transformations. Customize parameters in `mcs.py` as needed for each run, and consider maintaining a separate results directory for reproducibility and version control of transformation outputs.



