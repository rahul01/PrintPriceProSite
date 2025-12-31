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
            overheadPercentage: overheadPercentage.value,
            markupPercentage: markupPercentage.value
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log('Calculator data saved to localStorage');
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
                if (data.overheadPercentage && overheadPercentage) overheadPercentage.value = data.overheadPercentage;
                if (data.markupPercentage && markupPercentage) markupPercentage.value = data.markupPercentage;
                
                console.log('Calculator data loaded from localStorage');
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
        'overhead': {
            title: 'Overhead Percentage',
            content: `
                <p>This percentage is applied to the combined cost of <strong>Material and Labor</strong>. It covers non-direct expenses such as: <strong>failed prints/reprints</strong>, machine depreciation, consumables (glue, cleaning agents), and facility costs.</p>
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
    
    console.log("Script loaded - Initializing calculator");
    
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
    const overheadPercentage = document.getElementById('overhead-percentage');
    const markupPercentage = document.getElementById('markup-percentage');
    
    // Get result elements
    const resultMaterial = document.getElementById('result-material');
    const resultElectricity = document.getElementById('result-electricity');
    const resultLabor = document.getElementById('result-labor');
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
        'bambu-p1s': 140,
        'bambu-x1-carbon': 150,
        
        // Prusa Printers
        'prusa-mk4': 120,
        'prusa-mini-plus': 80,
        'prusa-xl': 200,
        
        // Creality Printers
        'creality-ender-3-v2': 120,
        'creality-ender-3-s1': 130,
        'creality-cr-10': 150,
        'creality-k1': 160,
        
        // Anycubic Printers
        'anycubic-kobra-2': 140,
        'anycubic-vyper': 135,
        
        // Elegoo Printers
        'elegoo-neptune-3': 125,
        
        // Artillery Printers
        'artillery-sidewinder-x2': 155,
        
        // Voron Printers
        'voron-2.4': 180,
        
        // Sovol Printers
        'sovol-sv06': 130,
        
        // Flashforge Printers
        'flashforge-adventurer-4': 110
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
        console.log("Calculating prices...");
        
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
            const overhead = parseFloat(overheadPercentage.value) || 0;
            const markup = parseFloat(markupPercentage.value) || 0;
            // When electricity rate field is empty, use 0 instead of a default value
            const elecRate = electricityRate.value.trim() === '' ? 0 : parseFloat(electricityRate.value) || 0;
            const selectedCurrency = currency.value || 'INR';
            const symbol = currencySymbols[selectedCurrency] || '₹';
            
            // Log input values for debugging
            console.log("Input values:", {
                materialWeight: matWeight,
                materialCost: matCost,
                printTimeTotal: pTime,
                power,
                laborRate: lRate,
                laborTime: lTime,
                overhead,
                markup,
                electricityRate: elecRate,
                currency: selectedCurrency
            });
            
            // Calculate costs
            // Material cost (convert material weight from g to kg)
            const materialCostValue = (matWeight / 1000) * matCost;
            
            // Electricity cost (power in W, time in hours, rate in $/kWh)
            const electricityCostValue = (power / 1000) * pTime * elecRate;
            
            // Labor cost (time in minutes converted to hours)
            const laborCostValue = (lTime / 60) * lRate;
            
            // Subtotal before overhead
            const subtotalBeforeOverhead = materialCostValue + electricityCostValue + laborCostValue;
            
            // Overhead amount
            const overheadValue = subtotalBeforeOverhead * (overhead / 100);
            
            // Subtotal including overhead
            const subtotalValue = subtotalBeforeOverhead + overheadValue;
            
            // Markup amount
            const markupValue = subtotalValue * (markup / 100);
            
            // Final price
            const finalValue = subtotalValue + markupValue;
            
            console.log("Calculated values:", {
                materialCost: materialCostValue,
                electricityCost: electricityCostValue,
                laborCost: laborCostValue,
                overhead: overheadValue,
                subtotal: subtotalValue,
                markup: markupValue,
                finalPrice: finalValue
            });
            
            // Update result elements
            resultMaterial.textContent = formatCurrency(materialCostValue, selectedCurrency);
            resultElectricity.textContent = formatCurrency(electricityCostValue, selectedCurrency);
            resultLabor.textContent = formatCurrency(laborCostValue, selectedCurrency);
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
            
            document.getElementById('calc-overhead').textContent = 
                `(${symbol}${subtotalBeforeOverhead.toFixed(2)}) × (${overhead}% / 100) = ${symbol}${overheadValue.toFixed(2)}`;
            
            document.getElementById('calc-subtotal').textContent = 
                `${symbol}${materialCostValue.toFixed(2)} + ${symbol}${electricityCostValue.toFixed(2)} + ${symbol}${laborCostValue.toFixed(2)} + ${symbol}${overheadValue.toFixed(2)} = ${symbol}${subtotalValue.toFixed(2)}`;
            
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
        laborRate, overheadPercentage, markupPercentage
    ];
    
    allInputs.forEach(input => {
        if (input) {
            // Add event listener for calculation
            input.addEventListener('input', calculatePrices);
            input.addEventListener('change', calculatePrices);
            
            // Add event listener for data persistence
            input.addEventListener('input', saveCalculatorData);
            input.addEventListener('change', saveCalculatorData);
            
            console.log(`Added event listener to ${input.id || 'unknown'} element`);
        }
    });
    
    // Load saved data from localStorage when page loads
    // Only run initial calculation if there was no saved data
    if (!loadCalculatorData()) {
        // If no data was loaded, initialize with default settings
        console.log('No saved data found, using defaults');
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
        if (overheadPercentage) overheadPercentage.value = '15';
        if (markupPercentage) markupPercentage.value = '30';
        
        // Update labels for currency
        document.querySelector('label[for="electricity-rate"]').textContent = `Electricity Rate (₹/kWh)`;
        
        // Preserve the info icon when updating the labor rate label
        const laborRateLabel = document.querySelector('label[for="labor-rate"]');
        const infoIcon = laborRateLabel.querySelector('.info-icon');
        laborRateLabel.innerHTML = `Labor Rate (₹/hour) `;
        if (infoIcon) laborRateLabel.appendChild(infoIcon);
        
        // Recalculate with default values
        calculatePrices();
        
        console.log('Calculator has been reset');
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