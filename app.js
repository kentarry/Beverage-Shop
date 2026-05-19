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
            });
            items.appendChild(item);
        });
        timeline.appendChild(div);
    });
}

// ========== Helpers ==========
function v(id) { return parseFloat(document.getElementById(id)?.value) || 0; }
function fmt(n) { return '$' + Math.round(n).toLocaleString(); }

// ========== Main Recalculation ==========
function recalcAll() {
    // Staff costs
    const managerCost = v('managerCount') * v('managerSalary');
    const ftCost = v('fullTimeCount') * v('fullTimeSalary');
    const ptCost = v('partTimeCount') * v('partTimeHourly') * v('partTimeHours');
    const baseSalary = managerCost + ftCost + ptCost;
    const insuranceAdd = baseSalary * (v('insuranceRate') / 100);
    const totalStaff = baseSalary + insuranceAdd + v('monthlyBonus');
    document.getElementById('totalStaffCost').textContent = fmt(totalStaff);

    // Rent & Renovation
    const monthlyRentTotal = v('monthlyRent') + v('mgmtFee');
    const depositCost = v('monthlyRent') * v('depositMonths');
    const renovationCost = v('interiorCost') + v('signCost') + v('plumbingCost') + v('acCost');
    document.getElementById('totalRenovation').textContent = fmt(renovationCost);

    // Material per cup
    const perCup = v('matTea') + v('matSugar') + v('matMilk') + v('matTopping') + v('matCup') + v('matBag');
    document.getElementById('perCupCost').textContent = fmt(perCup);

    // Revenue
    const avgPrice = v('avgPrice');
    const dailyCups = v('dailyCups');
    const monthlyDays = v('monthlyDays');
    const monthlyRev = avgPrice * dailyCups * monthlyDays;
    const monthlyMatCost = perCup * dailyCups * monthlyDays + v('matCleaning') + v('matOther');
    const grossProfit = monthlyRev - monthlyMatCost;
    const grossMargin = monthlyRev > 0 ? (grossProfit / monthlyRev * 100) : 0;

    document.getElementById('grossMargin').textContent = grossMargin.toFixed(1) + '%';
    document.getElementById('monthlyRevenue').textContent = fmt(monthlyRev);
    document.getElementById('monthlyMatCost').textContent = fmt(monthlyMatCost);
    document.getElementById('monthlyGross').textContent = fmt(grossProfit);

    // Franchise costs
    const franchiseFee = v('customFranchiseFee');
    const franchiseDeposit = v('customFranchiseDeposit');
    const royaltyMonthly = v('customRoyalty');
    const adFundMonthly = v('customAdFund');

    // Other monthly
    const otherMonthly = v('waterBill') + v('electricBill') + v('gasBill') + v('phoneBill') + v('posFee') + v('marketingFee') + v('taxFee') + v('miscFee');

    // Total monthly cost
    const totalMonthlyCost = monthlyMatCost + totalStaff + monthlyRentTotal + otherMonthly + royaltyMonthly + adFundMonthly;
    const monthlyNetProfit = monthlyRev - totalMonthlyCost;

    // Equipment
    const equipmentTotal = getEquipmentTotal();

    // Total initial investment
    const totalInvest = depositCost + renovationCost + equipmentTotal + franchiseFee + franchiseDeposit;

    // Payback
    const paybackMonths = monthlyNetProfit > 0 ? Math.ceil(totalInvest / monthlyNetProfit) : Infinity;

    // Update KPI
    document.getElementById('kpiTotalInvest').textContent = fmt(totalInvest);
    document.getElementById('kpiMonthlyRev').textContent = fmt(monthlyRev);
    document.getElementById('kpiMonthlyProfit').textContent = fmt(monthlyNetProfit);
    document.getElementById('kpiMonthlyProfit').style.color = monthlyNetProfit >= 0 ? 'var(--green)' : 'var(--red)';
    document.getElementById('kpiPayback').textContent = paybackMonths === Infinity ? '∞ 月' : paybackMonths + ' 月';

    // Breakeven
    document.getElementById('beTotalInvest').textContent = fmt(totalInvest);
    document.getElementById('beMonthlyNet').textContent = fmt(monthlyNetProfit);
    document.getElementById('beMonthlyNet').style.color = monthlyNetProfit >= 0 ? '' : 'var(--red)';
    document.getElementById('bePaybackMonths').textContent = paybackMonths === Infinity ? '無法回本' : paybackMonths + ' 月';

    // Breakeven cups per day
    const fixedMonthly = totalStaff + monthlyRentTotal + otherMonthly + royaltyMonthly + adFundMonthly + v('matCleaning') + v('matOther');
    const profitPerCup = avgPrice - perCup;
    const breakevenCupsDay = profitPerCup > 0 ? Math.ceil(fixedMonthly / profitPerCup / monthlyDays) : Infinity;
    document.getElementById('beBreakevenCups').textContent = breakevenCupsDay === Infinity ? '-- 杯' : breakevenCupsDay + ' 杯/日';

    // P&L Table
    renderPNL(monthlyRev, monthlyMatCost, totalStaff, monthlyRentTotal, otherMonthly, royaltyMonthly, adFundMonthly, monthlyNetProfit);

    // Summary
    renderSummary(totalInvest, monthlyRev, totalMonthlyCost, monthlyNetProfit, grossMargin, paybackMonths, breakevenCupsDay, dailyCups);

    // Scenarios
    renderScenarios(totalInvest, avgPrice, perCup, fixedMonthly, monthlyDays);

    // Charts
    renderCharts(monthlyMatCost, totalStaff, monthlyRentTotal, otherMonthly, royaltyMonthly + adFundMonthly, depositCost, renovationCost, equipmentTotal, franchiseFee + franchiseDeposit, totalInvest, monthlyNetProfit);
}

// ========== Render P&L ==========
function renderPNL(rev, mat, staff, rent, other, royalty, ad, net) {
    const el = document.getElementById('pnlTable');
    const rows = [
        { label: '營業收入', val: rev, cls: 'pnl-header' },
        { label: '　原物料成本', val: -mat },
        { label: '營業毛利', val: rev - mat, cls: 'pnl-total' },
        { label: '　人事費用', val: -staff },
        { label: '　店租+管理費', val: -rent },
        { label: '　水電瓦斯', val: -(v('waterBill') + v('electricBill') + v('gasBill')) },
        { label: '　行銷/POS/雜支', val: -(v('phoneBill') + v('posFee') + v('marketingFee') + v('taxFee') + v('miscFee')) },
        { label: '　權利金+廣告基金', val: -(royalty + ad) },
        { label: '每月淨利', val: net, cls: net >= 0 ? 'pnl-total' : 'pnl-total pnl-negative' },
    ];
    el.innerHTML = rows.map(r => `<div class="pnl-row ${r.cls || ''}"><span class="pnl-label">${r.label}</span><span class="pnl-val">${fmt(r.val)}</span></div>`).join('');
}

// ========== Render Summary ==========
function renderSummary(invest, rev, cost, net, margin, payback, beCups, dailyCups) {
    const el = document.getElementById('summaryList');
    const items = [
        ['總初始投資', fmt(invest)],
        ['月營業額', fmt(rev)],
        ['月總支出', fmt(cost)],
        ['月淨利', fmt(net)],
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
function renderScenarios(invest, price, cupCost, fixed, days) {
    const grid = document.getElementById('scenarioGrid');
    const scenarios = [
        { title: '😊 樂觀情境 (日銷300杯)', cups: 300 },
        { title: '😐 普通情境 (日銷200杯)', cups: 200 },
        { title: '😟 保守情境 (日銷120杯)', cups: 120 },
        { title: '😰 悲觀情境 (日銷80杯)', cups: 80 },
    ];
    grid.innerHTML = scenarios.map(sc => {
        const monthRev = price * sc.cups * days;
        const monthMat = cupCost * sc.cups * days;
        const monthNet = monthRev - monthMat - fixed;
        const pb = monthNet > 0 ? Math.ceil(invest / monthNet) : Infinity;
        return `<div class="scenario-card"><h4>${sc.title}</h4>
            <div class="sc-row"><span>月營收</span><span class="sc-val">${fmt(monthRev)}</span></div>
            <div class="sc-row"><span>月淨利</span><span class="sc-val" style="color:${monthNet >= 0 ? 'var(--green)' : 'var(--red)'}">${fmt(monthNet)}</span></div>
            <div class="sc-row"><span>回本</span><span class="sc-val">${pb === Infinity ? '無法回本' : pb + '個月'}</span></div>
        </div>`;
    }).join('');
}

// ========== Charts ==========
function renderCharts(mat, staff, rent, other, franchise, deposit, reno, equip, franchiseInvest, totalInvest, monthlyNet) {
    const chartOpts = {
        responsive: true,
        plugins: {
            legend: { labels: { color: '#9aa0b8', font: { size: 11 } } }
        }
    };

    // Cost Structure Pie
    if (charts.cost) charts.cost.destroy();
    charts.cost = new Chart(document.getElementById('costChart'), {
        type: 'doughnut',
        data: {
            labels: ['原物料', '人事', '店租', '水電雜支', '加盟費用'],
            datasets: [{ data: [mat, staff, rent, other, franchise], backgroundColor: ['#6c5ce7', '#00cec9', '#fdcb6e', '#fd79a8', '#74b9ff'], borderWidth: 0 }]
        },
        options: { ...chartOpts, cutout: '55%' }
    });

    // Investment Pie
    if (charts.invest) charts.invest.destroy();
    charts.invest = new Chart(document.getElementById('investChart'), {
        type: 'doughnut',
        data: {
            labels: ['押金', '裝潢', '設備', '加盟金/保證金'],
            datasets: [{ data: [deposit, reno, equip, franchiseInvest], backgroundColor: ['#a29bfe', '#ffeaa7', '#55efc4', '#fab1a0'], borderWidth: 0 }]
        },
        options: { ...chartOpts, cutout: '55%' }
    });

    // 12-month cashflow
    if (charts.cashflow) charts.cashflow.destroy();
    const cfLabels = [];
    const cfData = [];
    let cumulative = -totalInvest;
    for (let i = 1; i <= 12; i++) {
        cfLabels.push(i + '月');
        cumulative += monthlyNet;
        cfData.push(cumulative);
    }
    charts.cashflow = new Chart(document.getElementById('cashflowChart'), {
        type: 'line',
        data: {
            labels: cfLabels,
            datasets: [{
                label: '累計現金流',
                data: cfData,
                borderColor: '#6c5ce7',
                backgroundColor: 'rgba(108,92,231,0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: cfData.map(v => v >= 0 ? '#00cec9' : '#ff7675'),
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

    // Breakeven chart
    if (charts.breakeven) charts.breakeven.destroy();
    const beLabels = [];
    const beData = [];
    let beCum = -totalInvest;
    const months = Math.max(24, monthlyNet > 0 ? Math.ceil(totalInvest / monthlyNet) + 6 : 36);
    for (let i = 0; i <= Math.min(months, 48); i++) {
        beLabels.push(i === 0 ? '開店' : i + '月');
        beData.push(beCum);
        beCum += monthlyNet;
    }
    charts.breakeven = new Chart(document.getElementById('breakevenChart'), {
        type: 'line',
        data: {
            labels: beLabels,
            datasets: [{
                label: '累計損益',
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
    lines.push('毛利率: ' + document.getElementById('grossMargin').textContent);
    lines.push('月營業額: ' + document.getElementById('monthlyRevenue').textContent);
    lines.push('');

    lines.push('【六、損益兩平】');
    lines.push('日損益兩平杯數: ' + document.getElementById('beBreakevenCups').textContent);
    lines.push('回本月數: ' + document.getElementById('bePaybackMonths').textContent);

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
        saveState();
    }, 5000);
}

function saveState() {
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
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch(e) {}
}

function loadSavedState() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return;
        const state = JSON.parse(raw);
        // Restore input fields
        Object.keys(state).forEach(key => {
            if (key.startsWith('_')) return;
            const el = document.getElementById(key);
            if (el) el.value = state[key];
        });
        // Restore checklist
        if (state._checks) {
            document.querySelectorAll('.cl-check').forEach((el, i) => {
                if (state._checks.includes(i)) {
                    el.classList.add('checked');
                    el.closest('.cl-item')?.classList.add('done');
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
    } catch(e) {}
}
