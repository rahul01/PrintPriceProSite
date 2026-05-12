// 3D Printing Price Calculator
document.addEventListener('DOMContentLoaded', () => {
    // Initialize localStorage for data persistence
    const STORAGE_KEY = 'printPriceProData';
    
    // Function to save calculator data to localStorage
    function saveCalculatorData() {
        const data = {
            printer: printer.value,
            materialWeight: materialWeight.value,
            printTimeHours: printTimeHours.value,
            printTimeMinutes: printTimeMinutes.value,
            laborTime: laborTime.value,
            currency: currency.value,
            electricityRate: electricityRate.value,
            materialCost: materialCost.value,
            laborRate: laborRate.value,
            machineCostPerHour: machineCostPerHour.value,
            hardwareCost: hardwareCost.value,
            overheadPercentage: overheadPercentage.value,
            markupPercentage: markupPercentage.value
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    
    // Function to load calculator data from localStorage
    function loadCalculatorData() {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
                const data = JSON.parse(savedData);
                
                // Restore values to input fields if they exist
                if (data.printer && printer) printer.value = data.printer;
                if (data.materialWeight && materialWeight) materialWeight.value = data.materialWeight;
                if (data.printTimeHours && printTimeHours) printTimeHours.value = data.printTimeHours;
                if (data.printTimeMinutes && printTimeMinutes) printTimeMinutes.value = data.printTimeMinutes;
                if (data.laborTime && laborTime) laborTime.value = data.laborTime;
                if (data.currency && currency) currency.value = data.currency;
                if (data.electricityRate && electricityRate) electricityRate.value = data.electricityRate;
                if (data.materialCost && materialCost) materialCost.value = data.materialCost;
                if (data.laborRate && laborRate) laborRate.value = data.laborRate;
                if (data.machineCostPerHour !== undefined && machineCostPerHour) {
                    machineCostPerHour.value = data.machineCostPerHour;
                } else if (machineCostPerHour && printer) {
                    machineCostPerHour.value = printerMachineCost[printer.value] ?? 0;
                }
                if (data.hardwareCost !== undefined && hardwareCost) hardwareCost.value = data.hardwareCost;
                if (data.overheadPercentage && overheadPercentage) overheadPercentage.value = data.overheadPercentage;
                if (data.markupPercentage && markupPercentage) markupPercentage.value = data.markupPercentage;
                

                return true;
            }
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
        }
        return false;
    }
    
    // Info modal functionality
    const infoModal = document.getElementById('infoModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const closeModal = document.getElementById('closeModal');
    
    // Info content from app guide
    const infoContent = {
        'labor-rate': {
            title: 'Labor Rate Per Hour',
            content: `
                <p>The amount charged per hour for the time spent on a job. <strong>This rate should be included even if you are the owner performing the work</strong>, as your time is valuable. This covers:</p>
                <ul>
                    <li><strong>Pre-Print Setup:</strong> e.g., slicing, starting the print, <strong>loading/unloading spools - 1 to 5 min</strong></li>
                    <li><strong>Post-Processing Tasks:</strong> e.g., <strong>support material removal - 2 to 15 min per part</strong>, cleaning, sanding, and packaging</li>
                </ul>
            `
        },
        'machine-cost': {
            title: 'Machine Cost Per Hour',
            content: `
                <p>The amortised depreciation and maintenance cost of the printer per hour of use. <strong>This field is pre-filled based on the selected printer</strong> using the same values as the full app (calculated as approx. retail price ÷ 3 years × 365 days × 4 hours).</p>
                <p>You can override it with your own value. For example, if your printer cost ₹25,000 and you expect 1,000 hours of use, the machine cost is <strong>₹25/hour</strong>. Set to 0 to exclude it and account for depreciation via Overhead instead.</p>
            `
        },
        'hardware-cost': {
            title: 'Hardware Cost',
            content: `
                <p>The total cost of any physical hardware components used in this specific job. For example: <strong>heat-set inserts, screws, magnets, springs</strong>, or other embedded parts.</p>
                <p>Enter the combined cost for the entire job (e.g., 4 inserts × ₹2 + 2 screws × ₹1 = ₹10). Leave at 0 if no hardware is used.</p>
            `
        },
        'overhead': {
            title: 'Overhead Percentage',
            content: `
                <p>This percentage is applied to <strong>all Direct Costs</strong> (Material + Electricity + Labor + Machine + Hardware). It covers non-direct expenses such as: <strong>failed prints/reprints</strong>, consumables (glue, cleaning agents), and facility costs.</p>
            `
        },
        'markup': {
            title: 'Percentage Markup',
            content: `
                <p>This percentage is the final markup applied to the <strong>Total Cost (Material + Labor + Overhead)</strong> to determine the final selling price. It represents the <strong>net profit</strong> generated per job.</p>
            `
        },
        'power-consumption': {
            title: 'Power Consumption',
            content: `
                <p><strong>Use ACTUAL AVERAGE Power (Watts)</strong></p>
                <p>Your printer's power consumption is calculated from the selected printer model. The values shown are the actual average power consumption, not the rated (maximum) power.</p>
                <p><strong>Examples of Rated vs. Actual Average (PLA):</strong></p>
                <ul>
                    <li><strong>Bambu P1S:</strong> Rated 1100W, actual avg ~100–140W</li>
                    <li><strong>Ender 3 Series:</strong> Rated 360W, actual avg ~80–120W</li>
                    <li><strong>Prusa MK4:</strong> Rated 240W, actual avg ~80–100W</li>
                </ul>
                <p><em>Note:</em> Power consumption is highly variable. It increases significantly with <strong>higher print/bed temperatures</strong> (e.g., ABS/PC) and during the <strong>initial heat-up phase</strong> of the print.</p>
            `
        },
        // In-field calculator info removed as requested
    };
    
    // Add click event listeners to all info icons
    document.querySelectorAll('.info-icon').forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.preventDefault();
            const infoType = this.getAttribute('data-info');
            const info = infoContent[infoType];
            
            if (info) {
                modalTitle.textContent = info.title;
                modalContent.innerHTML = info.content;
                infoModal.classList.add('active');
            }
        });
    });
    
    // Close modal when clicking the close button
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            infoModal.classList.remove('active');
        });
    }
    
    // Close modal when clicking outside the modal content
    if (infoModal) {
        infoModal.addEventListener('click', function(e) {
            if (e.target === infoModal) {
                infoModal.classList.remove('active');
            }
        });
    }
    
    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && infoModal.classList.contains('active')) {
            infoModal.classList.remove('active');
        }
    });
    

    
    // Get UI elements
    const toggleFormulasBtn = document.getElementById('toggle-formulas');
    const resultsSection = document.getElementById('calculator-results');
    
    // Get input elements
    const printer = document.getElementById('printer');
    const materialWeight = document.getElementById('material-weight');
    const printTimeHours = document.getElementById('print-time-hours');
    const printTimeMinutes = document.getElementById('print-time-minutes');
    const laborTime = document.getElementById('labor-time');
    const currency = document.getElementById('currency');
    const electricityRate = document.getElementById('electricity-rate');
    const materialCost = document.getElementById('material-cost');
    const laborRate = document.getElementById('labor-rate');
    const machineCostPerHour = document.getElementById('machine-cost-per-hour');
    const hardwareCost = document.getElementById('hardware-cost');
    const overheadPercentage = document.getElementById('overhead-percentage');
    const markupPercentage = document.getElementById('markup-percentage');

    // Get result elements
    const resultMaterial = document.getElementById('result-material');
    const resultElectricity = document.getElementById('result-electricity');
    const resultLabor = document.getElementById('result-labor');
    const resultMachine = document.getElementById('result-machine');
    const resultHardware = document.getElementById('result-hardware');
    const resultOverhead = document.getElementById('result-overhead');
    const resultSubtotal = document.getElementById('result-subtotal');
    const resultMarkup = document.getElementById('result-markup');
    const resultFinal = document.getElementById('result-final');
    
    // Default printer power values (W)
    const printerPower = {
        // Other
        'other': 120,
        
        // Bambu Lab Printers
        'bambu-a1': 120,
        'bambu-a1-mini': 100,
        'bambu-a1-combo': 120,
        'bambu-p1s': 140,
        'bambu-p2s': 200,
        'bambu-x1-carbon': 150,
        'bambu-x1e': 350,
        'bambu-h2c': 350,
        'bambu-h2d': 500,

        // Prusa Printers
        'prusa-mk4': 120,
        'prusa-mk4s': 95,
        'prusa-mini-plus': 80,
        'prusa-xl': 200,
        'prusa-core-one': 100,

        // Creality Printers
        'creality-ender-3-v2': 120,
        'creality-ender-3-s1': 130,
        'creality-ender-3-v3-se': 150,
        'creality-ender-3-v3-ke': 180,
        'creality-cr-10': 150,
        'creality-k1': 160,
        'creality-k1c': 200,
        'creality-k1-max': 250,
        'creality-k2-plus': 350,

        // Anycubic Printers
        'anycubic-kobra-2': 140,
        'anycubic-kobra-3': 200,
        'anycubic-kobra-3-max': 500,
        'anycubic-kobra-x': 350,
        'anycubic-vyper': 135,

        // Elegoo Printers
        'elegoo-neptune-3': 125,
        'elegoo-neptune-4': 160,
        'elegoo-neptune-4-pro': 200,
        'elegoo-neptune-4-plus': 280,
        'elegoo-neptune-4-max': 400,

        // Artillery Printers
        'artillery-sidewinder-x2': 155,

        // Qidi Printers
        'qidi-q1-pro': 350,
        'qidi-x-plus-3': 400,
        'qidi-x-max-3': 400,

        // Voron Printers
        'voron-2.4': 180,

        // Sovol Printers
        'sovol-sv06': 130,

        // Flashforge Printers
        'flashforge-adventurer-4': 110,
        'flashforge-adventurer-5m': 200,
        'flashforge-adventurer-5m-pro': 320,

        // Ultimaker Printers
        'ultimaker-s3': 350,
        'ultimaker-s5': 500,

        // Kingroon Printers
        'kingroon-kp3s-pro-v2': 150,

        // Snapmaker Printers
        'snapmaker-artisan': 150,
        'snapmaker-2-a350t': 120,
        'snapmaker-2-a250t': 100,
        'snapmaker-j1s': 200,
        'snapmaker-u1': 220
    };

    // Machine cost per hour (INR), amortised depreciation from the app's pre-populated values
    const printerMachineCost = {
        'other': 0,

        // Bambu Lab
        'bambu-a1': 6.8,
        'bambu-a1-mini': 5.7,
        'bambu-a1-combo': 10.7,
        'bambu-p1s': 12.5,
        'bambu-p2s': 16.4,
        'bambu-x1-carbon': 16.0,
        'bambu-x1e': 70.5,
        'bambu-h2c': 46.6,
        'bambu-h2d': 51.4,

        // Prusa
        'prusa-mk4': 11.4,
        'prusa-mk4s': 24.9,
        'prusa-mini-plus': 5.7,
        'prusa-xl': 22.8,
        'prusa-core-one': 47.9,

        // Creality
        'creality-ender-3-v2': 3.4,
        'creality-ender-3-s1': 4.6,
        'creality-ender-3-v3-se': 4.3,
        'creality-ender-3-v3-ke': 6.3,
        'creality-cr-10': 5.7,
        'creality-k1': 6.8,
        'creality-k1c': 12.8,
        'creality-k1-max': 19.6,
        'creality-k2-plus': 36.5,

        // Anycubic
        'anycubic-kobra-2': 5.0,
        'anycubic-kobra-3': 6.7,
        'anycubic-kobra-3-max': 19.2,
        'anycubic-kobra-x': 5.8,
        'anycubic-vyper': 4.6,

        // Elegoo
        'elegoo-neptune-3': 4.1,
        'elegoo-neptune-4': 4.8,
        'elegoo-neptune-4-pro': 7.3,
        'elegoo-neptune-4-plus': 8.7,
        'elegoo-neptune-4-max': 9.1,

        // Artillery
        'artillery-sidewinder-x2': 5.0,

        // Qidi
        'qidi-q1-pro': 10.5,
        'qidi-x-plus-3': 15.9,
        'qidi-x-max-3': 19.2,

        // Voron
        'voron-2.4': 13.7,

        // Sovol
        'sovol-sv06': 3.9,

        // Flashforge
        'flashforge-adventurer-4': 8.0,
        'flashforge-adventurer-5m': 7.7,
        'flashforge-adventurer-5m-pro': 18.3,

        // Ultimaker
        'ultimaker-s3': 51.4,
        'ultimaker-s5': 59.6,

        // Kingroon
        'kingroon-kp3s-pro-v2': 5.3,

        // Snapmaker
        'snapmaker-artisan': 27.4,
        'snapmaker-2-a350t': 16.0,
        'snapmaker-2-a250t': 12.1,
        'snapmaker-j1s': 18.0,
        'snapmaker-u1': 19.5
    };

    // Currency symbols
    const currencySymbols = {
        'INR': '₹',
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'CAD': '$',
        'AUD': '$'
    };
    
    // Function to format currency
    const formatCurrency = (amount, currencyType = 'INR') => {
        const symbol = currencySymbols[currencyType] || '₹';
        return symbol + amount.toFixed(2);
    };
    
    // Toggle formulas button
    if (toggleFormulasBtn && resultsSection) {
        toggleFormulasBtn.addEventListener('click', function() {
            resultsSection.classList.toggle('show-formulas');
            this.textContent = resultsSection.classList.contains('show-formulas') ? 'Hide Formulas' : 'Show Formulas';
        });
    }
    
    // Make sure results section is visible
    if (resultsSection) {
        resultsSection.style.display = 'block';
        resultsSection.style.visibility = 'visible';
    }
    
    // Function to calculate prices
    function calculatePrices() {

        
        try {
            // Get values from inputs (with fallbacks to default values)
            const matWeight = parseFloat(materialWeight.value) || 0;
            const matCost = parseFloat(materialCost.value) || 0;
            const pTimeHours = parseFloat(printTimeHours.value) || 0;
            const pTimeMinutes = parseFloat(printTimeMinutes.value) || 0;
            // Convert hours and minutes to total hours
            const pTime = pTimeHours + (pTimeMinutes / 60);
            // Get power consumption from selected printer
            const selectedPrinter = printer.value;
            const power = printerPower[selectedPrinter] || 120; // Default to 120W if not found
            const lRate = parseFloat(laborRate.value) || 0;
            const lTime = parseFloat(laborTime.value) || 0;
            const machineRate = parseFloat(machineCostPerHour.value) || 0;
            const hwCost = parseFloat(hardwareCost.value) || 0;
            const overhead = parseFloat(overheadPercentage.value) || 0;
            const markup = parseFloat(markupPercentage.value) || 0;
            // When electricity rate field is empty, use 0 instead of a default value
            const elecRate = electricityRate.value.trim() === '' ? 0 : parseFloat(electricityRate.value) || 0;
            const selectedCurrency = currency.value || 'INR';
            const symbol = currencySymbols[selectedCurrency] || '₹';

            // Calculate costs
            // Material cost (convert material weight from g to kg)
            const materialCostValue = (matWeight / 1000) * matCost;

            // Electricity cost (power in W, time in hours, rate in currency/kWh)
            const electricityCostValue = (power / 1000) * pTime * elecRate;

            // Labor cost (time in minutes converted to hours)
            const laborCostValue = (lTime / 60) * lRate;

            // Machine cost (printer depreciation/maintenance per hour × print time)
            const machineCostValue = machineRate * pTime;

            // Hardware cost (per-job physical components)
            const hardwareCostValue = hwCost;

            // Direct costs (all job costs before overhead)
            const directCosts = materialCostValue + electricityCostValue + laborCostValue + machineCostValue + hardwareCostValue;

            // Overhead applied to all direct costs
            const overheadValue = directCosts * (overhead / 100);

            // Subtotal including overhead
            const subtotalValue = directCosts + overheadValue;

            // Markup / profit margin
            const markupValue = subtotalValue * (markup / 100);

            // Final price
            const finalValue = subtotalValue + markupValue;

            // Show/hide machine and hardware rows (only when non-zero)
            document.getElementById('result-machine-row').style.display = machineCostValue > 0 ? '' : 'none';
            document.getElementById('result-hardware-row').style.display = hardwareCostValue > 0 ? '' : 'none';

            // Update result elements
            resultMaterial.textContent = formatCurrency(materialCostValue, selectedCurrency);
            resultElectricity.textContent = formatCurrency(electricityCostValue, selectedCurrency);
            resultLabor.textContent = formatCurrency(laborCostValue, selectedCurrency);
            resultMachine.textContent = formatCurrency(machineCostValue, selectedCurrency);
            resultHardware.textContent = formatCurrency(hardwareCostValue, selectedCurrency);
            resultOverhead.textContent = formatCurrency(overheadValue, selectedCurrency);
            resultSubtotal.textContent = formatCurrency(subtotalValue, selectedCurrency);
            resultMarkup.textContent = formatCurrency(markupValue, selectedCurrency);
            resultFinal.textContent = formatCurrency(finalValue, selectedCurrency);

            // Update calculation details
            document.getElementById('calc-material').textContent =
                `(${matWeight} g / 1000) × ${symbol}${matCost} = ${symbol}${materialCostValue.toFixed(2)}`;

            document.getElementById('calc-electricity').textContent =
                `(${power} W / 1000) × ${pTime.toFixed(2)} hours × ${symbol}${elecRate} = ${symbol}${electricityCostValue.toFixed(2)}`;

            document.getElementById('calc-labor').textContent =
                `(${lTime} min / 60) × ${symbol}${lRate} = ${symbol}${laborCostValue.toFixed(2)}`;

            document.getElementById('calc-machine').textContent =
                `${symbol}${machineRate}/hr × ${pTime.toFixed(2)} hours = ${symbol}${machineCostValue.toFixed(2)}`;

            document.getElementById('calc-hardware').textContent =
                `${symbol}${hardwareCostValue.toFixed(2)}`;

            document.getElementById('calc-overhead').textContent =
                `${symbol}${directCosts.toFixed(2)} (direct costs) × (${overhead}% / 100) = ${symbol}${overheadValue.toFixed(2)}`;

            const subtotalParts = [
                `${symbol}${materialCostValue.toFixed(2)}`,
                `${symbol}${electricityCostValue.toFixed(2)}`,
                `${symbol}${laborCostValue.toFixed(2)}`
            ];
            if (machineCostValue > 0) subtotalParts.push(`${symbol}${machineCostValue.toFixed(2)}`);
            if (hardwareCostValue > 0) subtotalParts.push(`${symbol}${hardwareCostValue.toFixed(2)}`);
            subtotalParts.push(`${symbol}${overheadValue.toFixed(2)}`);
            document.getElementById('calc-subtotal').textContent =
                `${subtotalParts.join(' + ')} = ${symbol}${subtotalValue.toFixed(2)}`;

            document.getElementById('calc-markup').textContent =
                `${symbol}${subtotalValue.toFixed(2)} × (${markup}% / 100) = ${symbol}${markupValue.toFixed(2)}`;

            document.getElementById('calc-final').textContent =
                `${symbol}${subtotalValue.toFixed(2)} + ${symbol}${markupValue.toFixed(2)} = ${symbol}${finalValue.toFixed(2)}`;
            
        } catch (error) {
            console.error("Error calculating prices:", error);
        }
    }
    
    // Add input event listeners to recalculate on input changes
    const allInputs = [
        printer, materialWeight, printTimeHours, printTimeMinutes,
        laborTime, currency, electricityRate, materialCost,
        laborRate, machineCostPerHour, hardwareCost, overheadPercentage, markupPercentage
    ];
    
    // When printer changes, pre-fill machine cost from lookup (fires before the general listeners below)
    if (printer) {
        printer.addEventListener('change', function() {
            if (machineCostPerHour) {
                machineCostPerHour.value = printerMachineCost[this.value] ?? 0;
            }
        });
    }

    allInputs.forEach(input => {
        if (input) {
            // Add event listener for calculation
            input.addEventListener('input', calculatePrices);
            input.addEventListener('change', calculatePrices);

            // Add event listener for data persistence
            input.addEventListener('input', saveCalculatorData);
            input.addEventListener('change', saveCalculatorData);
            

        }
    });
    
    // Load saved data from localStorage when page loads
    // Only run initial calculation if there was no saved data
    if (!loadCalculatorData()) {
        // No saved data, pre-fill machine cost from the default printer
        if (machineCostPerHour && printer) {
            machineCostPerHour.value = printerMachineCost[printer.value] ?? 0;
        }
    } else {
        // If data was loaded, calculate prices immediately
        calculatePrices();
    }
    
    // Update currency symbols in labels when currency changes
    if (currency) {
        currency.addEventListener('change', function() {
            const selectedCurrency = this.value;
            const symbol = currencySymbols[selectedCurrency] || '₹';
            
            // Update labels
            document.querySelector('label[for="electricity-rate"]').textContent = `Electricity Rate (${symbol}/kWh)`;

            // Preserve the info icon when updating the labor rate label
            const laborRateLabel = document.querySelector('label[for="labor-rate"]');
            const laborInfoIcon = laborRateLabel.querySelector('.info-icon');
            laborRateLabel.innerHTML = `Labor Rate (${symbol}/hour) `;
            if (laborInfoIcon) laborRateLabel.appendChild(laborInfoIcon);

            document.querySelector('label[for="material-cost"]').textContent = `Material Cost per kg (${symbol})`;

            // Preserve the info icon when updating the machine cost label
            const machineCostLabel = document.querySelector('label[for="machine-cost-per-hour"]');
            const machineInfoIcon = machineCostLabel.querySelector('.info-icon');
            machineCostLabel.innerHTML = `Machine Cost (${symbol}/hour) `;
            if (machineInfoIcon) machineCostLabel.appendChild(machineInfoIcon);

            // Preserve the info icon when updating the hardware cost label
            const hardwareCostLabel = document.querySelector('label[for="hardware-cost"]');
            const hardwareInfoIcon = hardwareCostLabel.querySelector('.info-icon');
            hardwareCostLabel.innerHTML = `Hardware Cost (${symbol}) `;
            if (hardwareInfoIcon) hardwareCostLabel.appendChild(hardwareInfoIcon);
            
            // Update default values based on currency
            if (selectedCurrency === 'INR') {
                // Only update electricity rate if it's not empty and has a specific value
                if (electricityRate.value == "0.12") {
                    electricityRate.value = "8";
                }
                if (!laborRate.value || laborRate.value == "15") {
                    laborRate.value = "100";
                }
                if (!materialCost.value || materialCost.value == "25") {
                    materialCost.value = "1200";
                }
            } else if (selectedCurrency === 'USD') {
                // Only update electricity rate if it's not empty and has a specific value
                if (electricityRate.value == "8") {
                    electricityRate.value = "0.12";
                }
                if (!laborRate.value || laborRate.value == "100") {
                    laborRate.value = "15";
                }
                if (!materialCost.value || materialCost.value == "1200") {
                    materialCost.value = "25";
                }
            }
            
            // Save changes to localStorage
            saveCalculatorData();
            
            // Recalculate with new currency
            calculatePrices();
        });
    }
    
    // In-field calculation code removed as requested
    
    // Reset calculator function
    function resetCalculator() {
        // Clear localStorage
        localStorage.removeItem(STORAGE_KEY);
        
        // Reset all input fields
        if (printer) printer.value = 'bambu-a1';
        if (materialWeight) materialWeight.value = '';
        if (printTimeHours) printTimeHours.value = '';
        if (printTimeMinutes) printTimeMinutes.value = '';
        if (laborTime) laborTime.value = '';
        if (currency) currency.value = 'INR';
        if (electricityRate) electricityRate.value = '8';
        if (materialCost) materialCost.value = '1200';
        if (laborRate) laborRate.value = '100';
        if (machineCostPerHour) machineCostPerHour.value = printerMachineCost['bambu-a1'];
        if (hardwareCost) hardwareCost.value = '0';
        if (overheadPercentage) overheadPercentage.value = '15';
        if (markupPercentage) markupPercentage.value = '30';
        
        // Update labels for currency
        document.querySelector('label[for="electricity-rate"]').textContent = `Electricity Rate (₹/kWh)`;

        // Preserve the info icon when updating the labor rate label
        const laborRateLabel = document.querySelector('label[for="labor-rate"]');
        const infoIcon = laborRateLabel.querySelector('.info-icon');
        laborRateLabel.innerHTML = `Labor Rate (₹/hour) `;
        if (infoIcon) laborRateLabel.appendChild(infoIcon);

        document.querySelector('label[for="material-cost"]').textContent = `Material Cost per kg (₹)`;

        // Preserve info icons for machine/hardware labels
        const machineCostLabel = document.querySelector('label[for="machine-cost-per-hour"]');
        const machineInfoIcon = machineCostLabel.querySelector('.info-icon');
        machineCostLabel.innerHTML = `Machine Cost (₹/hour) `;
        if (machineInfoIcon) machineCostLabel.appendChild(machineInfoIcon);

        const hardwareCostLabel = document.querySelector('label[for="hardware-cost"]');
        const hardwareInfoIcon = hardwareCostLabel.querySelector('.info-icon');
        hardwareCostLabel.innerHTML = `Hardware Cost (₹) `;
        if (hardwareInfoIcon) hardwareCostLabel.appendChild(hardwareInfoIcon);
        
        // Recalculate with default values
        calculatePrices();
        

    }
    
    // Add event listener for Reset button
    const resetButton = document.getElementById('reset-calculator');
    if (resetButton) {
        resetButton.addEventListener('click', resetCalculator);
    }
    
    // Run initial calculation if needed
    setTimeout(calculatePrices, 500);
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        window.print();
    }
});