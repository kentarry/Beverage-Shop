// ========== App State & Init ==========
let charts = {};
let selectedFranchise = null;

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSalaryRef();
    initRentRef();
    initPartners();
    initEquipment();
    initFranchise();
    initSuppliers();
    initChecklist();
    initLogs();
    initCollaboration();
    bindAllInputs();
    loadSavedState();
    recalcAll();
    autoSaveSetup();
});

// ========== Navigation ==========
function initNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const sec = link.dataset.section;
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.getElementById(sec).classList.add('active');
            link.classList.add('active');
            document.getElementById('sidebar').classList.remove('open');
            if (sec === 'dashboard') recalcAll();
        });
    });
    document.getElementById('hamburgerBtn')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
    document.getElementById('exportBtn')?.addEventListener('click', exportReport);
    document.getElementById('resetBtn')?.addEventListener('click', () => {
        if (confirm('確定要重置所有設定為預設值嗎？\n所有已儲存的資料將會被清除。')) {
            localStorage.removeItem(SAVE_KEY);
            location.reload();
        }
    });
}

// ========== Bind All Inputs ==========
function bindAllInputs() {
    document.querySelectorAll('.input-field').forEach(inp => {
        inp.addEventListener('input', () => recalcAll());
    });
}

// ========== Partners ==========
function initPartners() {
    const countEl = document.getElementById('partnerCount');
    countEl.addEventListener('input', () => renderPartners());
    renderPartners();
}

function renderPartners() {
    const count = parseInt(document.getElementById('partnerCount').value) || 1;
    const list = document.getElementById('partnerList');
    list.innerHTML = '';
    const share = Math.floor(100 / count);
    for (let i = 0; i < count; i++) {
        const row = document.createElement('div');
        row.className = 'partner-row';
        row.innerHTML = `
            <div class="partner-num">${i + 1}</div>
            <input type="text" class="input-field" style="width:100%;text-align:left" placeholder="姓名" value="合夥人${i + 1}">
            <input type="number" class="input-field partner-invest" placeholder="出資額" value="${i === 0 ? 1000000 : 500000}">
            <input type="number" class="input-field partner-share" min="0" max="100" placeholder="持股%" value="${i === 0 ? 100 - share * (count - 1) : share}">
        `;
        list.appendChild(row);
    }
    list.querySelectorAll('input').forEach(inp => inp.addEventListener('input', () => {
        updatePartnerTotal();
        recalcAll();
    }));
    updatePartnerTotal();
}

function updatePartnerTotal() {
    let total = 0;
    document.querySelectorAll('.partner-share').forEach(el => total += parseFloat(el.value) || 0);
    const display = document.getElementById('totalSharePct');
    display.textContent = total + '%';
    display.style.color = total === 100 ? 'var(--green)' : 'var(--red)';
}

// ========== Equipment ==========
function initEquipment() {
    const tbody = document.getElementById('equipmentBody');
    EQUIPMENT_DATA.forEach((eq, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" class="eq-check" data-idx="${idx}" checked></td>
            <td><strong>${eq.name}</strong><br><small style="color:var(--text-muted)">${eq.category}</small></td>
            <td style="font-size:12px;color:var(--text-secondary)">${eq.spec}</td>
            <td style="color:var(--orange)">$${eq.newPrice.toLocaleString()}</td>
            <td style="color:var(--green)">$${eq.usedPrice.toLocaleString()}</td>
            <td><select class="eq-condition" data-idx="${idx}"><option value="new">全新</option><option value="used">二手</option></select></td>
            <td><input type="number" class="eq-qty" data-idx="${idx}" min="0" max="20" value="${eq.qty}"></td>
            <td class="eq-subtotal" data-idx="${idx}" style="font-weight:600;font-family:Inter,sans-serif">$${(eq.newPrice * eq.qty).toLocaleString()}</td>
        `;
        tbody.appendChild(tr);
    });
    document.querySelectorAll('.eq-check,.eq-condition,.eq-qty').forEach(el => {
        el.addEventListener('change', () => { updateEquipmentTotals(); recalcAll(); });
        el.addEventListener('input', () => { updateEquipmentTotals(); recalcAll(); });
    });
    document.getElementById('eqSelectAll').addEventListener('click', () => {
        document.querySelectorAll('.eq-check').forEach(cb => cb.checked = true);
        updateEquipmentTotals(); recalcAll();
    });
    document.getElementById('eqDeselectAll').addEventListener('click', () => {
        document.querySelectorAll('.eq-check').forEach(cb => cb.checked = false);
        updateEquipmentTotals(); recalcAll();
    });
    updateEquipmentTotals();
}

function updateEquipmentTotals() {
    let total = 0;
    document.querySelectorAll('.eq-check').forEach(cb => {
        const idx = cb.dataset.idx;
        const eq = EQUIPMENT_DATA[idx];
        const cond = document.querySelector(`.eq-condition[data-idx="${idx}"]`).value;
        const qty = parseInt(document.querySelector(`.eq-qty[data-idx="${idx}"]`).value) || 0;
        const price = cond === 'used' ? eq.usedPrice : eq.newPrice;
        const sub = cb.checked ? price * qty : 0;
        document.querySelector(`.eq-subtotal[data-idx="${idx}"]`).textContent = '$' + sub.toLocaleString();
        total += sub;
    });
    document.getElementById('eqTotal').textContent = '$' + total.toLocaleString();
}

function getEquipmentTotal() {
    let total = 0;
    document.querySelectorAll('.eq-check').forEach(cb => {
        if (!cb.checked) return;
        const idx = cb.dataset.idx;
        const eq = EQUIPMENT_DATA[idx];
        const cond = document.querySelector(`.eq-condition[data-idx="${idx}"]`).value;
        const qty = parseInt(document.querySelector(`.eq-qty[data-idx="${idx}"]`).value) || 0;
        total += (cond === 'used' ? eq.usedPrice : eq.newPrice) * qty;
    });
    return total;
}

// ========== Salary Reference ==========
function initSalaryRef() {
    const el = document.getElementById('salaryRefTable');
    if (!el || typeof SALARY_REFERENCE === 'undefined') return;
    let html = '<table class="ref-table"><thead><tr><th>職位</th><th>類型</th><th>薪資範圍</th><th>備註</th></tr></thead><tbody>';
    SALARY_REFERENCE.roles.forEach(r => {
        html += `<tr><td>${r.title}</td><td>${r.type}</td><td class="salary-range">${r.low.toLocaleString()} - ${r.high.toLocaleString()} ${r.unit}</td><td class="note-text">${r.note}</td></tr>`;
    });
    html += '</tbody></table>';
    el.innerHTML = html;
}

// ========== Rent Reference ==========
function initRentRef() {
    const el = document.getElementById('rentRefTable');
    if (!el || typeof ZHONGHE_RENT_DATA === 'undefined') return;
    let html = '<table class="ref-table"><thead><tr><th>區域</th><th>坪數</th><th>月租範圍</th><th>備註</th></tr></thead><tbody>';
    ZHONGHE_RENT_DATA.forEach(r => {
        html += `<tr><td>${r.area}</td><td>${r.range}</td><td class="rent-range">$${r.rentLow.toLocaleString()} - $${r.rentHigh.toLocaleString()}</td><td class="note-text">${r.note}</td></tr>`;
    });
    html += '</tbody></table>';
    el.innerHTML = html;
}

// ========== Suppliers ==========
function initSuppliers() {
    const container = document.getElementById('suppliersContainer');
    if (!container || typeof SUPPLIERS_DATA === 'undefined') return;
    SUPPLIERS_DATA.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'supplier-category';
        div.innerHTML = `<div class="supplier-category-title">${cat.category}</div><div class="supplier-cards"></div>`;
        const cards = div.querySelector('.supplier-cards');
        cat.suppliers.forEach(s => {
            const card = document.createElement('div');
            card.className = 'supplier-card';
            const addrLink = s.mapUrl ? `<a href="${s.mapUrl}" target="_blank">${s.address} 📍</a>` : s.address;
            card.innerHTML = `
                <div class="sup-name">${s.name}</div>
                <div class="sup-address">${addrLink}</div>
                <div class="sup-phone">📞 ${s.phone}</div>
                <div class="sup-note">💡 ${s.note}</div>
            `;
            cards.appendChild(card);
        });
        container.appendChild(div);
    });
}

// ========== Franchise ==========
function initFranchise() {
    const grid = document.getElementById('franchiseGrid');
    const statusLabels = { open:'可加盟', closed:'已暫停', limited:'限定區域', 'not-franchise':'非加盟' };
    FRANCHISE_DATA.forEach((fr, idx) => {
        const card = document.createElement('div');
        card.className = 'franchise-card';
        card.dataset.idx = idx;
        const statusBadge = fr.status ? `<span class="fc-status ${fr.status}">${statusLabels[fr.status] || fr.status}</span>` : '';
        card.innerHTML = `
            <div class="fc-header"><div class="fc-logo">${fr.icon}</div><div class="fc-name">${fr.name}</div>${statusBadge}</div>
            <div class="fc-row"><span class="fc-label">加盟金</span><span class="fc-val">${fr.fee}</span></div>
            <div class="fc-row"><span class="fc-label">保證金</span><span class="fc-val">${fr.deposit}</span></div>
            <div class="fc-row"><span class="fc-label">權利金</span><span class="fc-val">${fr.royalty}</span></div>
            <div class="fc-row"><span class="fc-label">廣告基金</span><span class="fc-val">${fr.adFund}</span></div>
            <div class="fc-row"><span class="fc-label">總投資預估</span><span class="fc-val">${fr.totalEst}</span></div>
            <div style="margin-top:8px;font-size:12px;color:var(--text-muted)">💡 ${fr.note}</div>
        `;
        card.addEventListener('click', () => {
            document.querySelectorAll('.franchise-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedFranchise = fr;
            document.getElementById('customFranchiseFee').value = fr.feeNum;
            document.getElementById('customFranchiseDeposit').value = fr.depositNum;
            // 帶入權利金：如果是營收百分比，用預估月營收計算
            const estMonthlyRev = v('avgPrice') * v('dailyCups') * v('monthlyDays');
            document.getElementById('customRoyalty').value = fr.royaltyPct > 0 ? Math.round(estMonthlyRev * fr.royaltyPct / 100) : 0;
            document.getElementById('customAdFund').value = fr.adPct > 0 ? Math.round(estMonthlyRev * fr.adPct / 100) : 0;
            recalcAll();
        });
        grid.appendChild(card);
    });
}

// ========== Checklist ==========
function initChecklist() {
    const timeline = document.getElementById('checklistTimeline');
    CHECKLIST_DATA.forEach(phase => {
        const div = document.createElement('div');
        div.className = 'cl-phase';
        div.innerHTML = `<div class="cl-phase-title"><span class="phase-badge">${phase.badge}</span>${phase.phase}</div><div class="cl-items"></div>`;
        const items = div.querySelector('.cl-items');
        phase.items.forEach(text => {
            const item = document.createElement('div');
            item.className = 'cl-item';
            item.innerHTML = `<div class="cl-check"></div><div class="cl-text">${text}</div>`;
            item.querySelector('.cl-check').addEventListener('click', function () {
                this.classList.toggle('checked');
                item.classList.toggle('done');
                const state = saveState();
                broadcastState(state);
            });
            items.appendChild(item);
        });
        timeline.appendChild(div);
    });
}

// ========== Helpers ==========
function v(id) { return parseFloat(document.getElementById(id)?.value) || 0; }
function fmt(n) {
    const abs = Math.abs(n);
    if (abs > 0 && abs < 100) return '$' + n.toFixed(1);
    return '$' + Math.round(n).toLocaleString();
}
function fmtInt(n) { return '$' + Math.round(n).toLocaleString(); }

// ========== Main Recalculation ==========
function recalcAll() {
    // Staff costs
    const managerCost = v('managerCount') * v('managerSalary');
    const ftCost = v('fullTimeCount') * v('fullTimeSalary');
    const ptCost = v('partTimeCount') * v('partTimeHourly') * v('partTimeHours');
    const baseSalary = managerCost + ftCost + ptCost;
    const insuranceAdd = baseSalary * (v('insuranceRate') / 100);
    const totalStaff = baseSalary + insuranceAdd + v('monthlyBonus');
    document.getElementById('totalStaffCost').textContent = fmtInt(totalStaff);

    // Rent & Renovation
    const monthlyRentTotal = v('monthlyRent') + v('mgmtFee');
    const depositCost = v('monthlyRent') * v('depositMonths');
    const renovationCost = v('interiorCost') + v('signCost') + v('plumbingCost') + v('acCost');
    document.getElementById('totalRenovation').textContent = fmtInt(renovationCost);

    // Material per cup (raw cost)
    const perCupRaw = v('matTea') + v('matSugar') + v('matMilk') + v('matTopping') + v('matCup') + v('matBag');
    document.getElementById('perCupCost').textContent = fmt(perCupRaw);

    // Material per cup (with wastage)
    const wastageRate = v('wastageRate') / 100;
    const perCup = perCupRaw * (1 + wastageRate);
    const perCupCostRealEl = document.getElementById('perCupCostReal');
    if (perCupCostRealEl) perCupCostRealEl.textContent = fmt(perCup);

    // Revenue
    const avgPrice = v('avgPrice');
    const dailyCups = v('dailyCups');
    const monthlyDays = v('monthlyDays');
    const monthlyRev = avgPrice * dailyCups * monthlyDays;
    const monthlyMatCost = perCup * dailyCups * monthlyDays + v('matCleaning') + v('matOther');
    const grossProfit = monthlyRev - monthlyMatCost;
    const grossMargin = monthlyRev > 0 ? (grossProfit / monthlyRev * 100) : 0;

    document.getElementById('grossMargin').textContent = grossMargin.toFixed(1) + '%';
    document.getElementById('monthlyRevenue').textContent = fmtInt(monthlyRev);
    document.getElementById('monthlyMatCost').textContent = fmtInt(monthlyMatCost);
    document.getElementById('monthlyGross').textContent = fmtInt(grossProfit);

    // Franchise costs
    const franchiseFee = v('customFranchiseFee');
    const franchiseDeposit = v('customFranchiseDeposit');
    const royaltyMonthly = v('customRoyalty');
    const adFundMonthly = v('customAdFund');

    // Delivery platform commission
    const deliveryPct = v('deliveryPct') / 100;
    const deliveryCommission = v('deliveryCommission') / 100;
    const deliveryFee = monthlyRev * deliveryPct * deliveryCommission;
    const deliveryFeeEl = document.getElementById('deliveryFee');
    if (deliveryFeeEl) deliveryFeeEl.textContent = fmtInt(deliveryFee);

    // Sales tax
    const salesTaxRate = v('salesTaxRate') / 100;
    const salesTax = monthlyRev > 200000 ? monthlyRev * salesTaxRate : 0;
    const salesTaxEl = document.getElementById('salesTaxAmount');
    if (salesTaxEl) salesTaxEl.textContent = fmtInt(salesTax);

    // Other monthly
    const otherMonthly = v('waterBill') + v('electricBill') + v('gasBill') + v('phoneBill') + v('posFee') + v('marketingFee') + v('taxFee') + v('miscFee');

    // Total monthly cost (now includes delivery commission and sales tax)
    const totalMonthlyCost = monthlyMatCost + totalStaff + monthlyRentTotal + otherMonthly + royaltyMonthly + adFundMonthly + deliveryFee + salesTax;
    const monthlyNetProfit = monthlyRev - totalMonthlyCost;

    // Equipment
    const equipmentTotal = getEquipmentTotal();

    // Startup misc costs
    const startupMisc = v('startupMisc');

    // Total initial investment
    const totalInvest = depositCost + renovationCost + equipmentTotal + franchiseFee + franchiseDeposit + startupMisc;

    // Working capital / reserve
    const reserveMonths = v('reserveMonths');
    const reserveAmount = totalMonthlyCost * reserveMonths;
    const reserveAmountEl = document.getElementById('reserveAmount');
    if (reserveAmountEl) reserveAmountEl.textContent = fmtInt(reserveAmount);
    const realTotalNeeded = totalInvest + reserveAmount;
    const realTotalEl = document.getElementById('realTotalNeeded');
    if (realTotalEl) realTotalEl.textContent = fmtInt(realTotalNeeded);

    // Payback
    const paybackMonths = monthlyNetProfit > 0 ? Math.ceil(totalInvest / monthlyNetProfit) : Infinity;

    // Update KPI
    document.getElementById('kpiTotalInvest').textContent = fmtInt(totalInvest);
    document.getElementById('kpiMonthlyRev').textContent = fmtInt(monthlyRev);
    document.getElementById('kpiMonthlyProfit').textContent = fmtInt(monthlyNetProfit);
    document.getElementById('kpiMonthlyProfit').style.color = monthlyNetProfit >= 0 ? 'var(--green)' : 'var(--red)';
    document.getElementById('kpiPayback').textContent = paybackMonths === Infinity ? '∞ 月' : paybackMonths + ' 月';

    // Breakeven
    document.getElementById('beTotalInvest').textContent = fmtInt(totalInvest);
    document.getElementById('beMonthlyNet').textContent = fmtInt(monthlyNetProfit);
    document.getElementById('beMonthlyNet').style.color = monthlyNetProfit >= 0 ? '' : 'var(--red)';
    document.getElementById('bePaybackMonths').textContent = paybackMonths === Infinity ? '無法回本' : paybackMonths + ' 月';

    // Breakeven cups per day (with wastage-adjusted cost)
    const fixedMonthly = totalStaff + monthlyRentTotal + otherMonthly + royaltyMonthly + adFundMonthly + deliveryFee + salesTax + v('matCleaning') + v('matOther');
    const profitPerCup = avgPrice - perCup;
    const breakevenCupsDay = profitPerCup > 0 ? Math.ceil(fixedMonthly / profitPerCup / monthlyDays) : Infinity;
    document.getElementById('beBreakevenCups').textContent = breakevenCupsDay === Infinity ? '-- 杯' : breakevenCupsDay + ' 杯/日';

    // P&L Table (updated with new cost items)
    renderPNL(monthlyRev, monthlyMatCost, totalStaff, monthlyRentTotal, otherMonthly, royaltyMonthly, adFundMonthly, deliveryFee, salesTax, monthlyNetProfit);

    // Summary
    renderSummary(totalInvest, monthlyRev, totalMonthlyCost, monthlyNetProfit, grossMargin, paybackMonths, breakevenCupsDay, dailyCups, realTotalNeeded, reserveAmount);

    // Scenarios (pass wastage-adjusted perCup and include delivery+tax in fixed)
    renderScenarios(totalInvest, avgPrice, perCup, fixedMonthly, monthlyDays, deliveryPct, deliveryCommission, salesTaxRate);

    // Charts (seasonal cashflow)
    renderCharts(monthlyMatCost, totalStaff, monthlyRentTotal, otherMonthly, royaltyMonthly + adFundMonthly, deliveryFee, salesTax, depositCost, renovationCost, equipmentTotal, franchiseFee + franchiseDeposit + startupMisc, totalInvest, monthlyNetProfit, monthlyRev, dailyCups, avgPrice, perCup, monthlyDays);
}

// ========== Render P&L ==========
function renderPNL(rev, mat, staff, rent, other, royalty, ad, delivery, salesTax, net) {
    const el = document.getElementById('pnlTable');
    const rows = [
        { label: '營業收入', val: rev, cls: 'pnl-header' },
        { label: '　原物料成本（含損耗）', val: -mat },
        { label: '營業毛利', val: rev - mat, cls: 'pnl-total' },
        { label: '　人事費用', val: -staff },
        { label: '　店租+管理費', val: -rent },
        { label: '　水電瓦斯', val: -(v('waterBill') + v('electricBill') + v('gasBill')) },
        { label: '　行銷/POS/雜支', val: -(v('phoneBill') + v('posFee') + v('marketingFee') + v('taxFee') + v('miscFee')) },
        { label: '　權利金+廣告基金', val: -(royalty + ad) },
        { label: '　🛵 外送平台抽成', val: -delivery },
        { label: '　📋 營業稅', val: -salesTax },
        { label: '每月淨利', val: net, cls: net >= 0 ? 'pnl-total' : 'pnl-total pnl-negative' },
    ];
    el.innerHTML = rows.map(r => `<div class="pnl-row ${r.cls || ''}"><span class="pnl-label">${r.label}</span><span class="pnl-val">${fmtInt(r.val)}</span></div>`).join('');
}

// ========== Render Summary ==========
function renderSummary(invest, rev, cost, net, margin, payback, beCups, dailyCups, realTotal, reserve) {
    const el = document.getElementById('summaryList');
    const items = [
        ['總初始投資', fmtInt(invest)],
        ['＋週轉金', fmtInt(reserve)],
        ['🔴 實際總需資金', fmtInt(realTotal)],
        ['月營業額', fmtInt(rev)],
        ['月總支出', fmtInt(cost)],
        ['月淨利', fmtInt(net)],
        ['毛利率', margin.toFixed(1) + '%'],
        ['淨利率', rev > 0 ? (net / rev * 100).toFixed(1) + '%' : '0%'],
        ['回本期', payback === Infinity ? '無法回本' : payback + ' 個月'],
        ['損益兩平杯數', beCups === Infinity ? '--' : beCups + ' 杯/日'],
        ['每日目標杯數', dailyCups + ' 杯'],
        ['達標率', beCups > 0 && beCups !== Infinity ? (dailyCups / beCups * 100).toFixed(0) + '%' : '--'],
    ];
    el.innerHTML = items.map(([l, v]) => `<div class="summary-item"><span class="s-label">${l}</span><span class="s-value">${v}</span></div>`).join('');
}

// ========== Render Scenarios ==========
function renderScenarios(invest, price, cupCost, fixed, days, deliveryPct, deliveryComm, taxRate) {
    const grid = document.getElementById('scenarioGrid');
    const baseCups = v('dailyCups') || 200;
    const scenarios = [
        { title: `😊 樂觀情境 (日銷${Math.round(baseCups * 1.5)}杯)`, cups: Math.round(baseCups * 1.5) },
        { title: `😐 普通情境 (日銷${Math.round(baseCups)}杯)`, cups: Math.round(baseCups) },
        { title: `😟 保守情境 (日銷${Math.round(baseCups * 0.6)}杯)`, cups: Math.round(baseCups * 0.6) },
        { title: `😰 悲觀情境 (日銷${Math.round(baseCups * 0.4)}杯)`, cups: Math.round(baseCups * 0.4) },
    ];
    grid.innerHTML = scenarios.map(sc => {
        const monthRev = price * sc.cups * days;
        const monthMat = cupCost * sc.cups * days;
        const scDelivery = monthRev * deliveryPct * deliveryComm;
        const scTax = monthRev > 200000 ? monthRev * taxRate : 0;
        const monthNet = monthRev - monthMat - fixed - scDelivery - scTax + (v('deliveryPct') > 0 ? monthRev * (v('deliveryPct')/100) * (v('deliveryCommission')/100) : 0) + (monthRev > 200000 ? monthRev * taxRate : 0);
        // Simplified: recalc net properly
        const actualFixed = fixed - (monthRev > 0 ? monthRev * (v('deliveryPct')/100) * (v('deliveryCommission')/100) : 0) - (monthRev > 200000 ? monthRev * (v('salesTaxRate')/100) : 0);
        const netProfit = monthRev - monthMat - actualFixed - scDelivery - scTax;
        const pb = netProfit > 0 ? Math.ceil(invest / netProfit) : Infinity;
        return `<div class="scenario-card"><h4>${sc.title}</h4>
            <div class="sc-row"><span>月營收</span><span class="sc-val">${fmtInt(monthRev)}</span></div>
            <div class="sc-row"><span>月淨利</span><span class="sc-val" style="color:${netProfit >= 0 ? 'var(--green)' : 'var(--red)'}">${fmtInt(netProfit)}</span></div>
            <div class="sc-row"><span>回本</span><span class="sc-val">${pb === Infinity ? '無法回本' : pb + '個月'}</span></div>
        </div>`;
    }).join('');
}

// ========== Charts ==========
// Seasonal coefficients: Jan=1, Feb=2... Dec=12
// Summer months (June-Sept) get boost, winter (Nov-Feb) get reduction, opening months ramp up
const SEASON_COEFF = [0.6, 0.55, 0.75, 0.85, 1.0, 1.3, 1.5, 1.5, 1.3, 1.0, 0.7, 0.6];
// Opening ramp-up: first 3 months are at 50%, 70%, 90% of target
const OPENING_RAMP = [0.5, 0.7, 0.9, 1.0];

function renderCharts(mat, staff, rent, other, franchise, delivery, salesTax, deposit, reno, equip, franchiseInvest, totalInvest, monthlyNet, monthlyRev, dailyCups, avgPrice, perCup, monthlyDays) {
    const chartOpts = {
        responsive: true,
        plugins: {
            legend: { labels: { color: '#9aa0b8', font: { size: 11 } } }
        }
    };

    // Cost Structure Pie (updated with new categories)
    if (charts.cost) charts.cost.destroy();
    charts.cost = new Chart(document.getElementById('costChart'), {
        type: 'doughnut',
        data: {
            labels: ['原物料', '人事', '店租', '水電雜支', '加盟費用', '外送抽成', '營業稅'],
            datasets: [{ data: [mat, staff, rent, other, franchise, delivery, salesTax], backgroundColor: ['#6c5ce7', '#00cec9', '#fdcb6e', '#fd79a8', '#74b9ff', '#e17055', '#fab1a0'], borderWidth: 0 }]
        },
        options: { ...chartOpts, cutout: '55%' }
    });

    // Investment Pie
    if (charts.invest) charts.invest.destroy();
    charts.invest = new Chart(document.getElementById('investChart'), {
        type: 'doughnut',
        data: {
            labels: ['押金', '裝潢', '設備', '加盟金/保證金/開辦費'],
            datasets: [{ data: [deposit, reno, equip, franchiseInvest], backgroundColor: ['#a29bfe', '#ffeaa7', '#55efc4', '#fab1a0'], borderWidth: 0 }]
        },
        options: { ...chartOpts, cutout: '55%' }
    });

    // 12-month cashflow WITH seasonal coefficients + opening ramp-up
    if (charts.cashflow) charts.cashflow.destroy();
    const cfLabels = [];
    const cfData = [];
    const cfMonthlyNet = [];
    let cumulative = -totalInvest;
    const now = new Date();
    const startMonth = now.getMonth(); // 0-indexed: 0=Jan
    const fixedCosts = staff + rent + other + franchise + v('matCleaning') + v('matOther');

    for (let i = 1; i <= 12; i++) {
        const calMonth = (startMonth + i - 1) % 12; // calendar month index
        const seasonCoeff = SEASON_COEFF[calMonth];
        const rampCoeff = i <= 3 ? OPENING_RAMP[i - 1] : OPENING_RAMP[3];
        const effectiveCoeff = seasonCoeff * rampCoeff;

        const mRev = avgPrice * dailyCups * monthlyDays * effectiveCoeff;
        const mMat = perCup * dailyCups * monthlyDays * effectiveCoeff + v('matCleaning') + v('matOther');
        const mDelivery = mRev * (v('deliveryPct') / 100) * (v('deliveryCommission') / 100);
        const mTax = mRev > 200000 ? mRev * (v('salesTaxRate') / 100) : 0;
        const mNet = mRev - mMat - staff - rent - other - franchise - mDelivery - mTax;

        const monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
        cfLabels.push(monthNames[calMonth]);
        cfMonthlyNet.push(mNet);
        cumulative += mNet;
        cfData.push(cumulative);
    }
    charts.cashflow = new Chart(document.getElementById('cashflowChart'), {
        type: 'line',
        data: {
            labels: cfLabels,
            datasets: [{
                label: '累計現金流（含季節+爬坡）',
                data: cfData,
                borderColor: '#6c5ce7',
                backgroundColor: 'rgba(108,92,231,0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: cfData.map(v => v >= 0 ? '#00cec9' : '#ff7675'),
            }, {
                label: '每月淨利',
                data: cfMonthlyNet,
                borderColor: 'rgba(253,203,110,0.6)',
                borderDash: [4, 4],
                fill: false,
                tension: 0.3,
                pointRadius: 3,
                pointBackgroundColor: cfMonthlyNet.map(v => v >= 0 ? '#fdcb6e' : '#ff7675'),
            }]
        },
        options: {
            ...chartOpts,
            scales: {
                x: { ticks: { color: '#6b7394' }, grid: { color: 'rgba(255,255,255,0.04)' } },
                y: { ticks: { color: '#6b7394', callback: v => '$' + (v / 10000).toFixed(0) + '萬' }, grid: { color: 'rgba(255,255,255,0.04)' } }
            }
        }
    });

    // Breakeven chart (also with seasonal variation)
    if (charts.breakeven) charts.breakeven.destroy();
    const beLabels = ['開店'];
    const beData = [-totalInvest];
    let beCum = -totalInvest;
    const maxMonths = 48;
    for (let i = 1; i <= maxMonths; i++) {
        const calMonth = (startMonth + i - 1) % 12;
        const seasonCoeff = SEASON_COEFF[calMonth];
        const rampCoeff = i <= 3 ? OPENING_RAMP[i - 1] : OPENING_RAMP[3];
        const effectiveCoeff = seasonCoeff * rampCoeff;

        const mRev = avgPrice * dailyCups * monthlyDays * effectiveCoeff;
        const mMat = perCup * dailyCups * monthlyDays * effectiveCoeff + v('matCleaning') + v('matOther');
        const mDelivery = mRev * (v('deliveryPct') / 100) * (v('deliveryCommission') / 100);
        const mTax = mRev > 200000 ? mRev * (v('salesTaxRate') / 100) : 0;
        const mNet = mRev - mMat - staff - rent - other - franchise - mDelivery - mTax;

        beCum += mNet;
        beLabels.push(i + '月');
        beData.push(beCum);
        // Stop early if we've been profitable for a while
        if (beCum > totalInvest * 0.5 && i > 12) break;
    }
    charts.breakeven = new Chart(document.getElementById('breakevenChart'), {
        type: 'line',
        data: {
            labels: beLabels,
            datasets: [{
                label: '累計損益（季節調整）',
                data: beData,
                borderColor: '#a29bfe',
                backgroundColor: ctx => {
                    const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
                    g.addColorStop(0, 'rgba(162,155,254,0.3)');
                    g.addColorStop(1, 'rgba(162,155,254,0)');
                    return g;
                },
                fill: true,
                tension: 0.3,
                pointRadius: 2,
            }, {
                label: '損益兩平線',
                data: beData.map(() => 0),
                borderColor: 'rgba(253,203,110,0.5)',
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
            }]
        },
        options: {
            ...chartOpts,
            scales: {
                x: { ticks: { color: '#6b7394', maxTicksLimit: 12 }, grid: { color: 'rgba(255,255,255,0.04)' } },
                y: { ticks: { color: '#6b7394', callback: v => '$' + (v / 10000).toFixed(0) + '萬' }, grid: { color: 'rgba(255,255,255,0.04)' } }
            }
        }
    });
}

// ========== Export Report ==========
function exportReport() {
    const lines = [];
    lines.push('═══════════════════════════════════════════');
    lines.push('        飲料店開店規劃報告書');
    lines.push('        生成日期: ' + new Date().toLocaleDateString('zh-TW'));
    lines.push('═══════════════════════════════════════════\n');

    lines.push('【一、投資總覽】');
    lines.push('總初始投資: ' + document.getElementById('kpiTotalInvest').textContent);
    const reserveEl = document.getElementById('reserveAmount');
    if (reserveEl) lines.push('建議週轉金: ' + reserveEl.textContent);
    const realTotalEl = document.getElementById('realTotalNeeded');
    if (realTotalEl) lines.push('★ 實際總需資金: ' + realTotalEl.textContent);
    lines.push('月營業額預估: ' + document.getElementById('kpiMonthlyRev').textContent);
    lines.push('月淨利預估: ' + document.getElementById('kpiMonthlyProfit').textContent);
    lines.push('預估回本月數: ' + document.getElementById('kpiPayback').textContent);
    lines.push('');

    lines.push('【二、人事編制】');
    lines.push(`店長: ${v('managerCount')}人 × $${v('managerSalary').toLocaleString()}/月`);
    lines.push(`正職: ${v('fullTimeCount')}人 × $${v('fullTimeSalary').toLocaleString()}/月`);
    lines.push(`工讀: ${v('partTimeCount')}人 × $${v('partTimeHourly')}/時 × ${v('partTimeHours')}時/月`);
    lines.push('每月人事總成本: ' + document.getElementById('totalStaffCost').textContent);
    lines.push('');

    lines.push('【三、店租裝潢】');
    lines.push(`月租金: $${v('monthlyRent').toLocaleString()}`);
    lines.push(`押金: ${v('depositMonths')}個月 = $${(v('monthlyRent') * v('depositMonths')).toLocaleString()}`);
    lines.push('裝潢總計: ' + document.getElementById('totalRenovation').textContent);
    lines.push('');

    lines.push('【四、設備清單】');
    document.querySelectorAll('.eq-check').forEach(cb => {
        if (!cb.checked) return;
        const idx = cb.dataset.idx;
        const eq = EQUIPMENT_DATA[idx];
        const cond = document.querySelector(`.eq-condition[data-idx="${idx}"]`).value;
        const qty = document.querySelector(`.eq-qty[data-idx="${idx}"]`).value;
        const price = cond === 'used' ? eq.usedPrice : eq.newPrice;
        lines.push(`  ✓ ${eq.name} (${cond === 'used' ? '二手' : '全新'}) × ${qty} = $${(price * qty).toLocaleString()}`);
    });
    lines.push('設備總計: ' + document.getElementById('eqTotal').textContent);
    lines.push('');

    lines.push('【五、營業預估】');
    lines.push(`平均單價: $${v('avgPrice')} | 日銷杯數: ${v('dailyCups')} | 月營業天數: ${v('monthlyDays')}`);
    lines.push(`原物料損耗率: ${v('wastageRate')}%`);
    lines.push('毛利率: ' + document.getElementById('grossMargin').textContent);
    lines.push('月營業額: ' + document.getElementById('monthlyRevenue').textContent);
    lines.push('');

    lines.push('【六、隱藏成本】');
    const deliveryEl = document.getElementById('deliveryFee');
    if (deliveryEl) lines.push(`外送平台抽成/月: ${deliveryEl.textContent} (占比${v('deliveryPct')}%, 抽成${v('deliveryCommission')}%)`);
    const taxEl = document.getElementById('salesTaxAmount');
    if (taxEl) lines.push(`營業稅/月: ${taxEl.textContent} (${v('salesTaxRate')}%)`);
    lines.push('');

    lines.push('【七、損益兩平】');
    lines.push('日損益兩平杯數: ' + document.getElementById('beBreakevenCups').textContent);
    lines.push('回本月數: ' + document.getElementById('bePaybackMonths').textContent);
    lines.push('');

    lines.push('【免責聲明】');
    lines.push('本報告僅供初步評估參考，實際金額請務必向各品牌總部/供應商直接確認。');
    lines.push('現金流預測已加入季節係數與開幕爬坡期調整。');

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `飲料店開店規劃報告_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
}

// ========== Auto Save / Load (localStorage) ==========
const SAVE_KEY = 'beverage_shop_planner_state';

function autoSaveSetup() {
    // Save state every 5 seconds if changed
    setInterval(() => {
        const state = saveState();
        broadcastState(state);
    }, 5000);
}

function getStateObj() {
    const state = {};
    document.querySelectorAll('.input-field').forEach(inp => {
        if (inp.id) state[inp.id] = inp.value;
    });
    // Save checklist state
    const checks = [];
    document.querySelectorAll('.cl-check').forEach((el, i) => {
        if (el.classList.contains('checked')) checks.push(i);
    });
    state._checks = checks;
    // Save equipment choices
    const eqState = [];
    document.querySelectorAll('.eq-check').forEach(cb => {
        const idx = cb.dataset.idx;
        eqState.push({
            checked: cb.checked,
            condition: document.querySelector(`.eq-condition[data-idx="${idx}"]`)?.value,
            qty: document.querySelector(`.eq-qty[data-idx="${idx}"]`)?.value
        });
    });
    state._equipment = eqState;
    // Save logs
    state._logs = appLogs;
    return state;
}

function saveState() {
    const state = getStateObj();
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch(e) {}
    return state;
}

function loadSavedState(stateObj = null) {
    try {
        let state = stateObj;
        if (!state) {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return;
            state = JSON.parse(raw);
        }
        // Restore input fields
        Object.keys(state).forEach(key => {
            if (key.startsWith('_')) return;
            const el = document.getElementById(key);
            if (el && el.value !== state[key]) el.value = state[key];
        });
        // Restore checklist
        if (state._checks) {
            document.querySelectorAll('.cl-check').forEach((el, i) => {
                if (state._checks.includes(i)) {
                    el.classList.add('checked');
                    el.closest('.cl-item')?.classList.add('done');
                } else {
                    el.classList.remove('checked');
                    el.closest('.cl-item')?.classList.remove('done');
                }
            });
        }
        // Restore equipment
        if (state._equipment) {
            state._equipment.forEach((eq, idx) => {
                const cb = document.querySelector(`.eq-check[data-idx="${idx}"]`);
                if (cb) cb.checked = eq.checked;
                const cond = document.querySelector(`.eq-condition[data-idx="${idx}"]`);
                if (cond && eq.condition) cond.value = eq.condition;
                const qty = document.querySelector(`.eq-qty[data-idx="${idx}"]`);
                if (qty && eq.qty) qty.value = eq.qty;
            });
            updateEquipmentTotals();
        }
        // Restore logs
        if (state._logs) {
            appLogs = state._logs;
            renderLogs();
        }
    } catch(e) {}
}

// ========== Operation Logs ==========
let appLogs = [];

function initLogs() {
    const btn = document.getElementById('btnAddLog');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const d = document.getElementById('logDate').value;
        const r = parseFloat(document.getElementById('logRevenue').value) || 0;
        const o = parseFloat(document.getElementById('logOrders').value) || 0;
        const c = parseFloat(document.getElementById('logCups').value) || 0;
        if (!d) return alert('請選擇日期');
        appLogs.push({ date: d, revenue: r, orders: o, cups: c, id: Date.now() });
        appLogs.sort((a,b) => new Date(b.date) - new Date(a.date));
        renderLogs();
        const state = saveState();
        broadcastState(state);
        document.getElementById('logRevenue').value = '';
        document.getElementById('logOrders').value = '';
        document.getElementById('logCups').value = '';
    });
}

function renderLogs() {
    const tbody = document.getElementById('logsTableBody');
    if (!tbody) return;
    tbody.innerHTML = appLogs.map(log => {
        const avgOrder = log.orders > 0 ? (log.revenue / log.orders).toFixed(1) : 0;
        return `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                <td style="padding:10px;">${log.date}</td>
                <td style="padding:10px; color:var(--green);">${fmtInt(log.revenue)}</td>
                <td style="padding:10px;">${log.orders}</td>
                <td style="padding:10px;">${log.cups}</td>
                <td style="padding:10px;">$${avgOrder}</td>
                <td style="padding:10px;">
                    <button onclick="deleteLog(${log.id})" style="background:transparent; border:none; color:var(--red); cursor:pointer;">❌</button>
                </td>
            </tr>
        `;
    }).join('');
}

window.deleteLog = function(id) {
    if (!confirm('確定刪除此筆紀錄？')) return;
    appLogs = appLogs.filter(L => L.id !== id);
    renderLogs();
    const state = saveState();
    broadcastState(state);
}

// ========== Collaboration (PeerJS) ==========
let peer = null;
let conn = null;

function initCollaboration() {
    const btnCreate = document.getElementById('btnCreateRoom');
    const btnJoin = document.getElementById('btnJoinRoom');
    const roomIdInput = document.getElementById('collabRoomId');
    const statusDiv = document.getElementById('collabStatus');

    if (!btnCreate) return;

    btnCreate.addEventListener('click', () => {
        if (peer) peer.destroy();
        peer = new Peer();
        statusDiv.textContent = '建立房間中...';
        statusDiv.style.color = 'var(--orange)';
        
        peer.on('open', id => {
            roomIdInput.value = id;
            statusDiv.textContent = '等待合夥人加入...';
            statusDiv.style.color = 'var(--blue)';
        });

        peer.on('connection', connection => {
            conn = connection;
            setupConnection(conn, statusDiv);
            // Send current state to new peer
            setTimeout(() => broadcastState(getStateObj()), 500);
        });
    });

    btnJoin.addEventListener('click', () => {
        const id = roomIdInput.value.trim();
        if (!id) return alert('請輸入房間代碼');
        
        if (peer) peer.destroy();
        peer = new Peer();
        statusDiv.textContent = '連線中...';
        statusDiv.style.color = 'var(--orange)';

        peer.on('open', () => {
            conn = peer.connect(id);
            setupConnection(conn, statusDiv);
        });
    });

    // Broadcast on any input change immediately
    document.querySelectorAll('.input-field').forEach(inp => {
        inp.addEventListener('change', () => {
            const state = saveState();
            broadcastState(state);
        });
    });
}

function setupConnection(connection, statusDiv) {
    connection.on('open', () => {
        statusDiv.textContent = '🟢 已連線 (即時同步中)';
        statusDiv.style.color = 'var(--green)';
    });

    connection.on('data', data => {
        if (data && data.type === 'STATE_SYNC') {
            loadSavedState(data.state);
            recalcAll();
        }
    });

    connection.on('close', () => {
        statusDiv.textContent = '🔴 連線已中斷';
        statusDiv.style.color = 'var(--red)';
        conn = null;
    });
}

function broadcastState(state) {
    if (conn && conn.open) {
        conn.send({ type: 'STATE_SYNC', state: state });
    }
}
