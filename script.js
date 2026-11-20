// 3D Printing Price Calculator
document.addEventListener('DOMContentLoaded', () => {
    let calcDebounceTimer;
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
            markupPercentage: markupPercentage.value,
            shippingCost: shippingCost.value,
            packagingCost: packagingCost.value,
            gstPercentage: gstPercentage.value,
            gatewayPercentage: gatewayPercentage.value,
            sellingPrice: sellingPrice.value
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
                if (data.shippingCost !== undefined && shippingCost) shippingCost.value = data.shippingCost;
                if (data.packagingCost !== undefined && packagingCost) packagingCost.value = data.packagingCost;
                if (data.gstPercentage !== undefined && gstPercentage) gstPercentage.value = data.gstPercentage;
                if (data.gatewayPercentage !== undefined && gatewayPercentage) gatewayPercentage.value = data.gatewayPercentage;
                if (data.sellingPrice !== undefined && sellingPrice) sellingPrice.value = data.sellingPrice;

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
        'shipping-cost': {
            title: 'Shipping Cost',
            content: `
                <p><strong>Per-job cost of getting the finished print to the customer.</strong></p>
                <p>What you pay a courier to deliver the job. Optional - leave at 0 if not applicable.</p>
                <p><strong>Unlike Hardware Cost, this is not marked up:</strong> Overhead % and Markup % apply only to Material + Labor + Electricity + Machine + Hardware. Shipping Cost is added <strong>after</strong> that markup, at near cost.</p>
            `
        },
        'packaging-cost': {
            title: 'Packaging Cost',
            content: `
                <p><strong>Per-job cost of packaging materials for the finished print.</strong></p>
                <p>Covers materials like a box, bubble wrap, or tape used to ship the job safely. Optional - leave at 0 if not applicable.</p>
                <p><strong>Unlike Hardware Cost, this is not marked up:</strong> Overhead % and Markup % apply only to Material + Labor + Electricity + Machine + Hardware. Packaging Cost is added <strong>after</strong> that markup, at near cost.</p>
            `
        },
        'gst': {
            title: 'GST Percentage',
            content: `
                <p>Applied <strong>last</strong>, on top of the complete price - Subtotal (Direct Costs + Overhead) + Markup + Shipping + Packaging. It is <strong>not</strong> applied to the pre-markup Subtotal alone, so your Markup % is never itself taxed.</p>
                <p>When GST is greater than 0, the results show both a <strong>Price Before GST</strong> line and a GST-inclusive <strong>Final Price</strong> line. Set it to 0 to hide GST entirely and quote tax-free.</p>
                <p>The full app defaults GST to <strong>12%</strong>, its baseline rate - change it to match your actual rate.</p>
            `
        },
        'gateway-charge': {
            title: 'Payment Gateway Charge',
            content: `
                <p>The fee your payment processor (Razorpay, Stripe, PayPal, etc.) takes out of a real sale. Set to <strong>0</strong> if you don't take payments through a gateway that charges a fee.</p>
                <p>Calculated on your <strong>full Selling Price</strong>, GST included - not the pre-tax amount - since that's what actually moves through your payment processor. Defaults to <strong>2%</strong>.</p>
                <p>This charge is not shown as its own line - it's folded into the <strong>Expenses</strong> total in the Selling Price &amp; Profit section below.</p>
            `
        },
        'selling-price': {
            title: 'Selling Price & Profit',
            content: `
                <p><strong>The real-world price you actually charged (or plan to charge) for this job.</strong></p>
                <p>Optional - leave blank if you only care about the calculated price above. Enter what the customer actually pays, <strong>including GST</strong> if you charge it.</p>
                <p>Once set, this splits into exactly <strong>three parts</strong> that always add up to the full amount: <strong>Expenses</strong>, <strong>Taxes</strong>, and <strong>Profit</strong>.</p>
                <p><strong>Expenses</strong> = every real cost of doing the job: Direct Costs + Overhead + Shipping + Packaging + Payment Gateway Charge.</p>
                <p><strong>Profit</strong> = what's left over after Taxes and Expenses - this is what you actually made on this specific sale, different from the Markup % above which is only a target.</p>
                <p>Each of the three also shows as a <strong>%</strong> of your Selling Price, and all three percentages always add up to <strong>100%</strong>.</p>
                <p><strong>Profit turns red when negative:</strong> that means the job lost money at that selling price.</p>
            `
        },
        'selling-price-taxes': {
            title: 'Why Taxes % looks lower than your GST rate',
            content: `
                <p>Say the pre-tax price of a job is <strong>₹100</strong>. At <strong>18% GST</strong>, the tax is <strong>₹18</strong>, so the customer pays <strong>₹118</strong> total - that ₹118 is the Selling Price.</p>
                <p>That same ₹18 of tax can be described two ways: <strong>18%</strong> of the ₹100 pre-tax price (your configured GST rate), or <strong>15.25%</strong> of the full ₹118 the customer paid.</p>
                <p>Taxes % here always shows the second version, because Expenses %, Taxes %, and Profit % are designed to add up to exactly <strong>100%</strong> of what the customer paid. The <strong>amount</strong> is identical either way - only the percentage's denominator differs from your configured GST %.</p>
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
                if (window.trackEvent) window.trackEvent('info_viewed', { info_type: infoType });
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
    const shippingCost = document.getElementById('shipping-cost');
    const packagingCost = document.getElementById('packaging-cost');
    const gstPercentage = document.getElementById('gst-percentage');
    const gatewayPercentage = document.getElementById('gateway-percentage');
    const sellingPrice = document.getElementById('selling-price');

    // Get result elements
    const resultMaterial = document.getElementById('result-material');
    const resultElectricity = document.getElementById('result-electricity');
    const resultLabor = document.getElementById('result-labor');
    const resultMachine = document.getElementById('result-machine');
    const resultHardware = document.getElementById('result-hardware');
    const resultOverhead = document.getElementById('result-overhead');
    const resultSubtotal = document.getElementById('result-subtotal');
    const resultMarkup = document.getElementById('result-markup');
    const resultShipping = document.getElementById('result-shipping');
    const resultPackaging = document.getElementById('result-packaging');
    const resultBeforeGst = document.getElementById('result-before-gst');
    const resultGst = document.getElementById('result-gst');
    const resultFinal = document.getElementById('result-final');
    const stickyPriceValue = document.getElementById('sticky-price-value');
    const sellingPriceResults = document.getElementById('selling-price-results');
    const resultSellingPrice = document.getElementById('result-selling-price');
    const resultExpenses = document.getElementById('result-expenses');
    const resultTaxes = document.getElementById('result-taxes');
    const resultProfit = document.getElementById('result-profit');
    
    // Default printer power values (W)
    const printerPower = {
        // Other
        'other': 120,

        // Bambu Lab Printers
        'bambu-lab-a1': 95,
        'bambu-lab-a1-combo': 100,
        'bambu-lab-a1-mini': 80,
        'bambu-lab-a2l': 145,
        'bambu-lab-h2c': 200,
        'bambu-lab-h2d': 200,
        'bambu-lab-h2s': 200,
        'bambu-lab-h3c': 240,
        'bambu-lab-p1p': 100,
        'bambu-lab-p1s': 105,
        'bambu-lab-p2s': 200,
        'bambu-lab-x1-carbon': 105,
        'bambu-lab-x1e': 185,
        'bambu-lab-x2d': 250,

        // Prusa Printers
        'prusa-core-one': 90,
        'prusa-core-one-l': 120,
        'prusa-mk3s': 80,
        'prusa-mk4': 80,
        'prusa-mk4s': 80,
        'prusa-mini': 80,
        'prusa-xl': 200,

        // Creality Printers
        'creality-cr-10': 150,
        'creality-ender-3-pro': 110,
        'creality-ender-3-s1': 130,
        'creality-ender-3-v2': 120,
        'creality-ender-3-v2-neo': 110,
        'creality-ender-3-v3': 110,
        'creality-ender-3-v3-ke': 140,
        'creality-ender-3-v3-plus': 150,
        'creality-ender-3-v3-se': 150,
        'creality-hi': 110,
        'creality-k1': 100,
        'creality-k1-max': 250,
        'creality-k1-se': 120,
        'creality-k1c': 145,
        'creality-k2': 140,
        'creality-k2-plus': 250,
        'creality-k2-pro': 160,
        'creality-k2-se': 110,
        'creality-sparkx-i7': 110,

        // Anycubic Printers
        'anycubic-kobra-2': 160,
        'anycubic-kobra-2-neo': 100,
        'anycubic-kobra-3': 200,
        'anycubic-kobra-3-max': 300,
        'anycubic-kobra-3-v2': 180,
        'anycubic-kobra-4': 120,
        'anycubic-kobra-s1': 180,
        'anycubic-kobra-s1-max': 300,
        'anycubic-kobra-x': 350,
        'anycubic-vyper': 135,

        // Elegoo Printers
        'elegoo-centauri-2': 90,
        'elegoo-centauri-carbon': 100,
        'elegoo-centauri-carbon-2': 100,
        'elegoo-neptune-3': 125,
        'elegoo-neptune-4': 160,
        'elegoo-neptune-4-max': 225,
        'elegoo-neptune-4-plus': 150,
        'elegoo-neptune-4-pro': 160,

        // Artillery Printers
        'artillery-sidewinder-x2': 155,

        // Qidi Printers
        'qidi-max4': 300,
        'qidi-plus4': 245,
        'qidi-plus5': 250,
        'qidi-q1-pro': 180,
        'qidi-q2': 160,
        'qidi-x-max-3': 260,
        'qidi-x-plus-3': 210,

        // Voron Printers
        'voron-2-4': 180,

        // Sovol Printers
        'sovol-sv06': 130,
        'sovol-sv06-ace': 100,
        'sovol-sv07-plus': 180,
        'sovol-sv08': 200,

        // Flashforge Printers
        'flashforge-ad5x': 115,
        'flashforge-adventurer-4': 110,
        'flashforge-adventurer-5m': 130,
        'flashforge-adventurer-5m-pro': 140,
        'flashforge-creator-5-pro': 200,

        // Ultimaker Printers
        'ultimaker-s3': 120,
        'ultimaker-s5': 150,

        // Kingroon Printers
        'kingroon-kp3s-pro-v2': 150,

        // Snapmaker Printers
        'snapmaker-2-0-a250t': 100,
        'snapmaker-2-0-a350t': 120,
        'snapmaker-artisan': 150,
        'snapmaker-j1s': 200,
        'snapmaker-u1': 120,

        // Elegoo (SLA/Resin)
        'elegoo-jupiter-2': 130,
        'elegoo-mars-4-ultra': 45,
        'elegoo-mars-5': 35,
        'elegoo-mars-5-ultra': 40,
        'elegoo-saturn-3-ultra': 75,
        'elegoo-saturn-4': 60,
        'elegoo-saturn-4-ultra-12k': 60,
        'elegoo-saturn-4-ultra-16k': 85,

        // Anycubic (SLA/Resin)
        'anycubic-photon-mono-4': 30,
        'anycubic-photon-mono-4-ultra': 35,
        'anycubic-photon-mono-m5s': 50,
        'anycubic-photon-mono-m7-pro': 90,
        'anycubic-photon-mono-x2': 60,
        'anycubic-photon-p1': 90,
        'anycubic-photon-p1-max': 120,

        // Phrozen (SLA/Resin)
        'phrozen-sonic-mini-8k': 45,
        'phrozen-sonic-mini-8k-s': 30,

        // Creality (SLA/Resin)
        'creality-halot-mage-s': 65,

        // Formlabs (SLA/Resin)
        'formlabs-form-studio-1': 20,

        // UniFormation (SLA/Resin)
        'uniformation-gktwo': 90,

    };

    // Machine cost per hour (INR), amortised depreciation from the app's pre-populated values
    const printerMachineCost = {
        'other': 0,

        // Bambu Lab
        'bambu-lab-a1': 6.8,
        'bambu-lab-a1-combo': 10.7,
        'bambu-lab-a1-mini': 5.7,
        'bambu-lab-a2l': 11.2,
        'bambu-lab-h2c': 46.6,
        'bambu-lab-h2d': 51.4,
        'bambu-lab-h2s': 34.0,
        'bambu-lab-h3c': 50.2,
        'bambu-lab-p1p': 8.0,
        'bambu-lab-p1s': 12.5,
        'bambu-lab-p2s': 16.4,
        'bambu-lab-x1-carbon': 16.0,
        'bambu-lab-x1e': 70.5,
        'bambu-lab-x2d': 22.6,

        // Prusa
        'prusa-core-one': 47.9,
        'prusa-core-one-l': 36.1,
        'prusa-mk3s': 20.1,
        'prusa-mk4': 11.4,
        'prusa-mk4s': 24.9,
        'prusa-mini': 5.7,
        'prusa-xl': 22.8,

        // Creality
        'creality-cr-10': 5.7,
        'creality-ender-3-pro': 4.2,
        'creality-ender-3-s1': 4.6,
        'creality-ender-3-v2': 3.4,
        'creality-ender-3-v2-neo': 4.6,
        'creality-ender-3-v3': 6.0,
        'creality-ender-3-v3-ke': 6.3,
        'creality-ender-3-v3-plus': 10.5,
        'creality-ender-3-v3-se': 4.3,
        'creality-hi': 9.8,
        'creality-k1': 6.8,
        'creality-k1-max': 19.6,
        'creality-k1-se': 6.0,
        'creality-k1c': 12.8,
        'creality-k2': 16.4,
        'creality-k2-plus': 36.5,
        'creality-k2-pro': 17.1,
        'creality-k2-se': 10.0,
        'creality-sparkx-i7': 7.8,

        // Anycubic
        'anycubic-kobra-2': 5.0,
        'anycubic-kobra-2-neo': 4.3,
        'anycubic-kobra-3': 6.7,
        'anycubic-kobra-3-max': 19.2,
        'anycubic-kobra-3-v2': 11.2,
        'anycubic-kobra-4': 5.6,
        'anycubic-kobra-s1': 14.4,
        'anycubic-kobra-s1-max': 27.4,
        'anycubic-kobra-x': 5.8,
        'anycubic-vyper': 4.6,

        // Elegoo
        'elegoo-centauri-2': 6.0,
        'elegoo-centauri-carbon': 8.7,
        'elegoo-centauri-carbon-2': 7.0,
        'elegoo-neptune-3': 4.1,
        'elegoo-neptune-4': 4.8,
        'elegoo-neptune-4-max': 9.1,
        'elegoo-neptune-4-plus': 8.7,
        'elegoo-neptune-4-pro': 7.3,

        // Artillery
        'artillery-sidewinder-x2': 5.0,

        // Qidi
        'qidi-max4': 21.1,
        'qidi-plus4': 14.0,
        'qidi-plus5': 15.0,
        'qidi-q1-pro': 10.5,
        'qidi-q2': 10.0,
        'qidi-x-max-3': 19.2,
        'qidi-x-plus-3': 15.9,

        // Voron
        'voron-2-4': 13.7,

        // Sovol
        'sovol-sv06': 3.9,
        'sovol-sv06-ace': 5.6,
        'sovol-sv07-plus': 7.6,
        'sovol-sv08': 11.4,

        // Flashforge
        'flashforge-ad5x': 8.0,
        'flashforge-adventurer-4': 8.0,
        'flashforge-adventurer-5m': 7.7,
        'flashforge-adventurer-5m-pro': 18.3,
        'flashforge-creator-5-pro': 19.1,

        // Ultimaker
        'ultimaker-s3': 51.4,
        'ultimaker-s5': 59.6,

        // Kingroon
        'kingroon-kp3s-pro-v2': 5.3,

        // Snapmaker
        'snapmaker-2-0-a250t': 12.1,
        'snapmaker-2-0-a350t': 16.0,
        'snapmaker-artisan': 27.4,
        'snapmaker-j1s': 18.0,
        'snapmaker-u1': 19.5,

        // Elegoo (SLA/Resin)
        'elegoo-jupiter-2': 19.1,
        'elegoo-mars-4-ultra': 3.4,
        'elegoo-mars-5': 3.6,
        'elegoo-mars-5-ultra': 7.2,
        'elegoo-saturn-3-ultra': 8.0,
        'elegoo-saturn-4': 6.4,
        'elegoo-saturn-4-ultra-12k': 12.6,
        'elegoo-saturn-4-ultra-16k': 11.4,

        // Anycubic (SLA/Resin)
        'anycubic-photon-mono-4': 4.8,
        'anycubic-photon-mono-4-ultra': 7.3,
        'anycubic-photon-mono-m5s': 4.6,
        'anycubic-photon-mono-m7-pro': 12.6,
        'anycubic-photon-mono-x2': 6.8,
        'anycubic-photon-p1': 17.7,
        'anycubic-photon-p1-max': 27.4,

        // Phrozen (SLA/Resin)
        'phrozen-sonic-mini-8k': 4.1,
        'phrozen-sonic-mini-8k-s': 8.0,

        // Creality (SLA/Resin)
        'creality-halot-mage-s': 5.0,

        // Formlabs (SLA/Resin)
        'formlabs-form-studio-1': 14.0,

        // UniFormation (SLA/Resin)
        'uniformation-gktwo': 15.1,

    };

    // Currency symbols
    const currencySymbols = {
        'INR': '₹',
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'AUD': 'A$',
        'CAD': 'CA$',
        'NZD': 'NZ$',
        'ZAR': 'ZAR',
        'BRL': 'R$',
        'DKK': 'DKK',
        'PHP': '₱',
        'MXN': 'MX$',
        'IDR': 'IDR',
        'RON': 'RON',
        'SGD': 'SGD'
    };
    
    // Function to format currency
    const formatCurrency = (amount, currencyType = 'INR') => {
        const symbol = currencySymbols[currencyType] || '₹';
        return symbol + amount.toFixed(2);
    };

    const slaPrinters = new Set([
        'elegoo-jupiter-2',
        'elegoo-mars-4-ultra',
        'elegoo-mars-5',
        'elegoo-mars-5-ultra',
        'elegoo-saturn-3-ultra',
        'elegoo-saturn-4',
        'elegoo-saturn-4-ultra-12k',
        'elegoo-saturn-4-ultra-16k',
        'anycubic-photon-mono-4',
        'anycubic-photon-mono-4-ultra',
        'anycubic-photon-mono-m5s',
        'anycubic-photon-mono-m7-pro',
        'anycubic-photon-mono-x2',
        'anycubic-photon-p1',
        'anycubic-photon-p1-max',
        'phrozen-sonic-mini-8k',
        'phrozen-sonic-mini-8k-s',
        'creality-halot-mage-s',
        'formlabs-form-studio-1',
        'uniformation-gktwo',
    ]);

    function updateMaterialCostLabel() {
        const selectedPrinter = printer ? printer.value : 'other';
        const selectedCurrency = currency ? currency.value : 'INR';
        const symbol = currencySymbols[selectedCurrency] || '₹';
        const unit = slaPrinters.has(selectedPrinter) ? 'liter' : 'kg';
        document.querySelector('label[for="material-cost"]').textContent = `Material Cost per ${unit} (${symbol})`;
    }
    
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
            const shipCost = parseFloat(shippingCost.value) || 0;
            const packCost = parseFloat(packagingCost.value) || 0;
            const gst = parseFloat(gstPercentage.value) || 0;
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

            // Shipping and Packaging are pass-through costs added after Overhead/Markup,
            // not marked up by either percentage
            const shippingCostValue = shipCost;
            const packagingCostValue = packCost;

            // Price before GST includes the pass-through Shipping/Packaging costs
            const finalBeforeGstValue = subtotalValue + markupValue + shippingCostValue + packagingCostValue;

            // GST is the outermost markup, applied to the complete pre-tax total
            const gstValue = finalBeforeGstValue * (gst / 100);

            // Final price (GST-inclusive)
            const finalValue = finalBeforeGstValue + gstValue;

            // Selling Price / Expenses / Taxes / Profit three-way split (optional, only when
            // a Selling Price is entered) — mirrors CalculatePriceUseCase.kt in the app exactly.
            const gatewayPct = parseFloat(gatewayPercentage.value) || 0;
            const sellingPriceValue = parseFloat(sellingPrice.value) || 0;
            let preTaxSellingPriceValue = 0;
            let gatewayChargeValue = 0;
            let expensesValue = 0;
            let taxesValue = 0;
            let profitValue = 0;
            if (sellingPriceValue > 0) {
                preTaxSellingPriceValue = sellingPriceValue / (1 + gst / 100);
                gatewayChargeValue = sellingPriceValue * (gatewayPct / 100);
                taxesValue = sellingPriceValue - preTaxSellingPriceValue;
                expensesValue = directCosts + overheadValue + shippingCostValue + packagingCostValue + gatewayChargeValue;
                profitValue = sellingPriceValue - taxesValue - expensesValue;
            }

            // Show/hide machine and hardware rows (only when non-zero)
            document.getElementById('result-machine-row').style.display = machineCostValue > 0 ? '' : 'none';
            document.getElementById('result-hardware-row').style.display = hardwareCostValue > 0 ? '' : 'none';
            document.getElementById('result-shipping-row').style.display = shippingCostValue > 0 ? '' : 'none';
            document.getElementById('result-packaging-row').style.display = packagingCostValue > 0 ? '' : 'none';
            document.getElementById('result-before-gst-row').style.display = gstValue > 0 ? '' : 'none';
            document.getElementById('result-gst-row').style.display = gstValue > 0 ? '' : 'none';

            // Update result elements
            resultMaterial.textContent = formatCurrency(materialCostValue, selectedCurrency);
            resultElectricity.textContent = formatCurrency(electricityCostValue, selectedCurrency);
            resultLabor.textContent = formatCurrency(laborCostValue, selectedCurrency);
            resultMachine.textContent = formatCurrency(machineCostValue, selectedCurrency);
            resultHardware.textContent = formatCurrency(hardwareCostValue, selectedCurrency);
            resultOverhead.textContent = formatCurrency(overheadValue, selectedCurrency);
            resultSubtotal.textContent = formatCurrency(subtotalValue, selectedCurrency);
            resultMarkup.textContent = formatCurrency(markupValue, selectedCurrency);
            resultShipping.textContent = formatCurrency(shippingCostValue, selectedCurrency);
            resultPackaging.textContent = formatCurrency(packagingCostValue, selectedCurrency);
            resultBeforeGst.textContent = formatCurrency(finalBeforeGstValue, selectedCurrency);
            resultGst.textContent = formatCurrency(gstValue, selectedCurrency);
            resultFinal.textContent = formatCurrency(finalValue, selectedCurrency);
            if (stickyPriceValue) stickyPriceValue.textContent = formatCurrency(finalValue, selectedCurrency);

            // Selling Price & Profit section (only shown when a Selling Price is entered)
            if (sellingPriceValue > 0) {
                sellingPriceResults.style.display = '';
                resultSellingPrice.textContent = formatCurrency(sellingPriceValue, selectedCurrency);
                resultExpenses.textContent = formatCurrency(expensesValue, selectedCurrency) +
                    ` (${(sellingPriceValue !== 0 ? expensesValue / sellingPriceValue * 100 : 0).toFixed(1)}%)`;
                resultTaxes.textContent = formatCurrency(taxesValue, selectedCurrency) +
                    ` (${(sellingPriceValue !== 0 ? taxesValue / sellingPriceValue * 100 : 0).toFixed(1)}%)`;
                resultProfit.textContent = formatCurrency(profitValue, selectedCurrency) +
                    ` (${(sellingPriceValue !== 0 ? profitValue / sellingPriceValue * 100 : 0).toFixed(1)}%)`;
                resultProfit.classList.toggle('negative', profitValue < 0);

                document.getElementById('calc-expenses').textContent =
                    `${symbol}${directCosts.toFixed(2)} + ${symbol}${overheadValue.toFixed(2)} + ${symbol}${shippingCostValue.toFixed(2)} + ${symbol}${packagingCostValue.toFixed(2)} + ${symbol}${gatewayChargeValue.toFixed(2)} (gateway charge) = ${symbol}${expensesValue.toFixed(2)}`;

                document.getElementById('calc-taxes').textContent =
                    `${symbol}${sellingPriceValue.toFixed(2)} − ${symbol}${preTaxSellingPriceValue.toFixed(2)} (pre-tax) = ${symbol}${taxesValue.toFixed(2)}`;

                document.getElementById('calc-profit').textContent =
                    `${symbol}${sellingPriceValue.toFixed(2)} − ${symbol}${taxesValue.toFixed(2)} − ${symbol}${expensesValue.toFixed(2)} = ${symbol}${profitValue.toFixed(2)}`;
            } else {
                sellingPriceResults.style.display = 'none';
            }

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

            document.getElementById('calc-shipping').textContent =
                `${symbol}${shippingCostValue.toFixed(2)}`;

            document.getElementById('calc-packaging').textContent =
                `${symbol}${packagingCostValue.toFixed(2)}`;

            const beforeGstParts = [
                `${symbol}${subtotalValue.toFixed(2)}`,
                `${symbol}${markupValue.toFixed(2)}`
            ];
            if (shippingCostValue > 0) beforeGstParts.push(`${symbol}${shippingCostValue.toFixed(2)}`);
            if (packagingCostValue > 0) beforeGstParts.push(`${symbol}${packagingCostValue.toFixed(2)}`);
            document.getElementById('calc-before-gst').textContent =
                `${beforeGstParts.join(' + ')} = ${symbol}${finalBeforeGstValue.toFixed(2)}`;

            document.getElementById('calc-gst').textContent =
                `${symbol}${finalBeforeGstValue.toFixed(2)} × (${gst}% / 100) = ${symbol}${gstValue.toFixed(2)}`;

            const finalParts = [
                `${symbol}${subtotalValue.toFixed(2)}`,
                `${symbol}${markupValue.toFixed(2)}`
            ];
            if (shippingCostValue > 0) finalParts.push(`${symbol}${shippingCostValue.toFixed(2)}`);
            if (packagingCostValue > 0) finalParts.push(`${symbol}${packagingCostValue.toFixed(2)}`);
            if (gstValue > 0) finalParts.push(`${symbol}${gstValue.toFixed(2)}`);
            document.getElementById('calc-final').textContent =
                `${finalParts.join(' + ')} = ${symbol}${finalValue.toFixed(2)}`;

            if (window.trackEvent && (matWeight > 0 || pTime > 0)) {
                clearTimeout(calcDebounceTimer);
                calcDebounceTimer = setTimeout(() => {
                    window.trackEvent('calculator_used', {
                        printer: selectedPrinter,
                        currency: selectedCurrency,
                        print_time_min: Math.round(pTime * 60),
                        material_weight_g: Math.round(matWeight)
                    });
                }, 2000);
            }

        } catch (error) {
            console.error("Error calculating prices:", error);
        }
    }
    
    // Add input event listeners to recalculate on input changes
    const allInputs = [
        printer, materialWeight, printTimeHours, printTimeMinutes,
        laborTime, currency, electricityRate, materialCost,
        laborRate, machineCostPerHour, hardwareCost, overheadPercentage, markupPercentage,
        shippingCost, packagingCost, gstPercentage, gatewayPercentage, sellingPrice
    ];
    
    // When printer changes, pre-fill machine cost from lookup (fires before the general listeners below)
    if (printer) {
        printer.addEventListener('change', function() {
            if (machineCostPerHour) {
                machineCostPerHour.value = printerMachineCost[this.value] ?? 0;
            }
            updateMaterialCostLabel();
            if (window.trackEvent) window.trackEvent('printer_selected', { printer: this.value });
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
    updateMaterialCostLabel();
    
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

            updateMaterialCostLabel();

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

            // Preserve the info icon when updating the shipping cost label
            const shippingCostLabel = document.querySelector('label[for="shipping-cost"]');
            const shippingInfoIcon = shippingCostLabel.querySelector('.info-icon');
            shippingCostLabel.innerHTML = `Shipping Cost (${symbol}) `;
            if (shippingInfoIcon) shippingCostLabel.appendChild(shippingInfoIcon);

            // Preserve the info icon when updating the packaging cost label
            const packagingCostLabel = document.querySelector('label[for="packaging-cost"]');
            const packagingInfoIcon = packagingCostLabel.querySelector('.info-icon');
            packagingCostLabel.innerHTML = `Packaging Cost (${symbol}) `;
            if (packagingInfoIcon) packagingCostLabel.appendChild(packagingInfoIcon);

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
            
            if (window.trackEvent) window.trackEvent('currency_changed', { currency: this.value });

            // Save changes to localStorage
            saveCalculatorData();

            // Recalculate with new currency
            calculatePrices();
        });
    }
    
    // In-field calculation code removed as requested
    
    // Reset calculator function
    function resetCalculator() {
        if (window.trackEvent) window.trackEvent('calculator_reset');

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
        if (shippingCost) shippingCost.value = '0';
        if (packagingCost) packagingCost.value = '0';
        if (gstPercentage) gstPercentage.value = '12';
        if (gatewayPercentage) gatewayPercentage.value = '2';
        if (sellingPrice) sellingPrice.value = '';

        // Update labels for currency
        document.querySelector('label[for="electricity-rate"]').textContent = `Electricity Rate (₹/kWh)`;

        // Preserve the info icon when updating the labor rate label
        const laborRateLabel = document.querySelector('label[for="labor-rate"]');
        const infoIcon = laborRateLabel.querySelector('.info-icon');
        laborRateLabel.innerHTML = `Labor Rate (₹/hour) `;
        if (infoIcon) laborRateLabel.appendChild(infoIcon);

        updateMaterialCostLabel();

        // Preserve info icons for machine/hardware labels
        const machineCostLabel = document.querySelector('label[for="machine-cost-per-hour"]');
        const machineInfoIcon = machineCostLabel.querySelector('.info-icon');
        machineCostLabel.innerHTML = `Machine Cost (₹/hour) `;
        if (machineInfoIcon) machineCostLabel.appendChild(machineInfoIcon);

        const hardwareCostLabel = document.querySelector('label[for="hardware-cost"]');
        const hardwareInfoIcon = hardwareCostLabel.querySelector('.info-icon');
        hardwareCostLabel.innerHTML = `Hardware Cost (₹) `;
        if (hardwareInfoIcon) hardwareCostLabel.appendChild(hardwareInfoIcon);

        const shippingCostLabel = document.querySelector('label[for="shipping-cost"]');
        const shippingInfoIcon = shippingCostLabel.querySelector('.info-icon');
        shippingCostLabel.innerHTML = `Shipping Cost (₹) `;
        if (shippingInfoIcon) shippingCostLabel.appendChild(shippingInfoIcon);

        const packagingCostLabel = document.querySelector('label[for="packaging-cost"]');
        const packagingInfoIcon = packagingCostLabel.querySelector('.info-icon');
        packagingCostLabel.innerHTML = `Packaging Cost (₹) `;
        if (packagingInfoIcon) packagingCostLabel.appendChild(packagingInfoIcon);

        // Recalculate with default values
        calculatePrices();
        

    }
    
    // Add event listener for Reset button
    const resetButton = document.getElementById('reset-calculator');
    if (resetButton) {
        resetButton.addEventListener('click', resetCalculator);
    }

    // Track feedback link clicks (mailto link in the nav, present on every page)
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
        link.addEventListener('click', function() {
            if (window.trackEvent) window.trackEvent('feedback_link_clicked');
        });
    });

    // Mobile hamburger menu toggle
    const navToggle = document.getElementById('nav-toggle');
    const navLinksMenu = document.querySelector('.nav-links');
    if (navToggle && navLinksMenu) {
        navToggle.addEventListener('click', function() {
            const isOpen = navLinksMenu.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Close the menu after tapping a link
        navLinksMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navLinksMenu.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
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