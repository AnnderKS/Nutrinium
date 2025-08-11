document.addEventListener("DOMContentLoaded", () => {
    // -------------------------------------------------------------------
    // --- CONFIGURAÇÃO DA LOGO ---
    // Coloque o caminho para a sua logo padrão aqui.
    // Exemplo: './img/logo.png'
    const defaultLogoPath = './img/Nutrinium - SVG.svg';
    const defaultLogoPNG = './img/teste.png';
    // -------------------------------------------------------------------

    // --- FUNÇÕES DE UI (INTERFACE DO USUÁRIO) ---
    const showToast = (message, type = 'success') => {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    const validateFields = (fieldIds) => {
        let isValid = true;
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        for (const id of fieldIds) {
            const field = document.getElementById(id);
            if (!field || field.value.trim() === '' || (field.type === 'number' && parseFloat(field.value) <= 0)) {
                isValid = false;
                const errorContainer = document.querySelector(`.error-message[data-for="${id}"]`);
                if (field) field.classList.add('input-error');
                if (errorContainer) errorContainer.textContent = 'Campo obrigatório.';
            }
        }
        return isValid;
    };

    const getCssVariable = (variable) => getComputedStyle(document.documentElement).getPropertyValue(variable).trim();

    // --- Lógica de Navegação ---
    const navButtons = document.querySelectorAll(".nav-button");
    const calculatorSections = document.querySelectorAll(".calculator-section");
    navButtons.forEach(button => {
        button.addEventListener("click", () => {
            const tab = button.dataset.tab;
            navButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            calculatorSections.forEach(section => { section.style.display = section.id === tab ? "block" : "none"; });
            if (tab === 'history') renderHistory();
        });
    });

    // --- Funções de Cálculo ---
    const calculateBMI = (w, h) => w / ((h / 100) ** 2);
    const calculateBMR = (w, h, a, g) => g === 'male' ? 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a) : 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a);
    const calculateTDEE = (b, act) => b * act;
    const calculateMacros = (d) => { let t = calculateTDEE(calculateBMR(d.weight, d.height, d.age, d.gender), d.activityLevel); if (d.bodyFat) t = ((d.weight * (1 - d.bodyFat / 100)) * 22) * d.activityLevel; let c = t; if (d.goal === 'weight-loss') c *= 0.8; if (d.goal === 'definition') c *= 0.85; if (d.goal === 'muscle-gain') c *= 1.15; let p, cr, f; if (d.useCustomMacros && d.customMacros) { p = d.customMacros.protein / 100; cr = d.customMacros.carbs / 100; f = d.customMacros.fat / 100 } else { switch (d.goal) { case 'weight-loss': p = 0.3; cr = 0.35; f = 0.35; break; case 'definition': p = 0.35; cr = 0.3; f = 0.35; break; case 'muscle-gain': p = 0.25; cr = 0.5; f = 0.25; break; default: p = 0.25; cr = 0.45; f = 0.3 } } return { calories: Math.round(c), protein: Math.round((c * p) / 4), carbs: Math.round((c * cr) / 4), fat: Math.round((c * f) / 9) } };
    const getBodyFatClassification = (bf, gender) => {
  if (gender === 'male') {
    if (bf < 3) return 'Nível de competição (extremamente baixo)';
    if (bf < 6) return 'Atleta';
    if (bf < 14) return 'Atlético';
    if (bf < 18) return 'Fitness';
    if (bf < 25) return 'Normal';
    return 'Obeso';
  } else {
    if (bf < 10) return 'Nível de competição (extremamente baixo)';
    if (bf < 14) return 'Atleta';
    if (bf < 20) return 'Fitness';
    if (bf < 25) return 'Normal';
    if (bf < 32) return 'Acima do normal';
    return 'Obeso';
  }
}
    const siri = (dc) => (495 / dc) - 450;

    // --- Calculadora TMB/GET ---
    document.getElementById("calculate-tmb").addEventListener("click", () => { if (!validateFields(['tmb-age', 'tmb-weight', 'tmb-height'])) return; const a = parseInt(document.getElementById('tmb-age').value), g = document.getElementById('tmb-gender').value, w = parseFloat(document.getElementById('tmb-weight').value), h = parseFloat(document.getElementById('tmb-height').value), ac = parseFloat(document.getElementById('tmb-activity').value), b = calculateBMR(w, h, a, g), t = calculateTDEE(b, ac); document.getElementById('tmb-value').textContent = `${b.toFixed(0)} kcal/dia`; document.getElementById('tdee-value').textContent = `${t.toFixed(0)} kcal/dia`; document.getElementById('tmb-result-container').style.display = 'block'; });

    // --- Calculadora de Macros ---
    const macroToggle = document.getElementById('macro-use-custom-toggle');
    const customMacroInputs = ['macro-custom-protein', 'macro-custom-carbs', 'macro-custom-fat'].map(id => document.getElementById(id));
    const macroSumValidationEl = document.getElementById('macro-sum-validation');
    const calculateMacrosBtn = document.getElementById('calculate-macros');
    const validateMacroInputs = () => { let sum = 0; customMacroInputs.forEach(input => { let value = parseInt(input.value); if (isNaN(value) || value < 0) value = 0; if (value > 100) value = 100; input.value = value; sum += value; }); macroSumValidationEl.textContent = `Total: ${sum}%`; const isValid = sum === 100; macroSumValidationEl.className = `macro-sum ${isValid ? 'valid' : 'invalid'}`; if (macroToggle.classList.contains('active')) { calculateMacrosBtn.disabled = !isValid; } };
    macroToggle.addEventListener('click', () => { macroToggle.classList.toggle('active'); document.getElementById('macro-custom-inputs').style.display = macroToggle.classList.contains('active') ? 'block' : 'none'; calculateMacrosBtn.disabled = false; validateMacroInputs(); });
    customMacroInputs.forEach(input => input.addEventListener('input', validateMacroInputs));
    calculateMacrosBtn.addEventListener("click", () => { if (!validateFields(['macro-age', 'macro-weight', 'macro-height'])) return; const u = macroToggle.classList.contains('active'), d = { age: parseInt(document.getElementById('macro-age').value), gender: document.getElementById('macro-gender').value, weight: parseFloat(document.getElementById('macro-weight').value), height: parseFloat(document.getElementById('macro-height').value), activityLevel: parseFloat(document.getElementById('macro-activity').value), bodyFat: document.getElementById('macro-bodyfat').value ? parseFloat(document.getElementById('macro-bodyfat').value) : undefined, goal: document.querySelector('input[name="goal"]:checked').value, useCustomMacros: u, customMacros: u ? { protein: parseInt(customMacroInputs[0].value), carbs: parseInt(customMacroInputs[1].value), fat: parseInt(customMacroInputs[2].value) } : null }, r = calculateMacros(d); document.getElementById('macro-calories').textContent = r.calories; document.getElementById('macro-protein').textContent = `${r.protein}g/dia`; document.getElementById('macro-carbs').textContent = `${r.carbs}g/dia`; document.getElementById('macro-fat').textContent = `${r.fat}g/dia`; document.getElementById('macro-protein-kcal').textContent = `${r.protein * 4}kcal`; document.getElementById('macro-carbs-kcal').textContent = `${r.carbs * 4}kcal`; document.getElementById('macro-fat-kcal').textContent = `${r.fat * 9}kcal`; document.getElementById('macro-result-container').style.display = 'block'; });
    
    // --- Avaliação Física ---
    const assessSelect = document.getElementById('assessment-method'), fieldsContainer = document.getElementById('assessment-fields-container'), calcAssessBtn = document.getElementById('calculate-assessment'), saveAssessBtn = document.getElementById("save-assessment"), assessGenderSelect = document.getElementById('assessment-gender');
    const fLabels = { triceps: 'Tríceps', abdomen: 'Abdominal', thigh: 'Coxa', subscapular: 'Subescapular', chest: 'Peitoral', midaxillary: 'Axilar Média', suprailiac: 'Suprailíaca', biceps: 'Bíceps' };
    const allMethods = { pollock3: { l: 'Pollock 3 Dobras', f_male: ['chest', 'abdomen', 'thigh'], f_female: ['triceps', 'suprailiac', 'thigh'] }, pollock4: { l: 'Pollock 4 Dobras', f: ['triceps', 'abdomen', 'suprailiac', 'thigh'] }, pollock7: { l: 'Pollock 7 Dobras', f: ['chest', 'abdomen', 'thigh', 'subscapular', 'suprailiac', 'triceps', 'midaxillary'] }, durnin: { l: 'Durnin & Womersley', f: ['biceps', 'triceps', 'subscapular', 'suprailiac'] }, faulkner: { l: 'Faulkner', f: ['triceps', 'subscapular', 'suprailiac'] }, slaughter: { l: 'Slaughter (Crianças)', f: ['triceps', 'subscapular'] }, guedes: { l: 'Guedes', f: ['triceps', 'suprailiac', 'thigh'] } };
    const updateAssessFields = () => { const methodKey = assessSelect.value, gender = assessGenderSelect.value, method = allMethods[methodKey]; const fields = (method.f_male && gender === 'male') ? method.f_male : (method.f_female && gender === 'female') ? method.f_female : method.f; fieldsContainer.innerHTML = ''; fields.forEach(field => { fieldsContainer.innerHTML += `<div><label>${fLabels[field]}*</label><input type="number" id="assessment-${field}" placeholder="mm" step="0.1"><div class="error-message" data-for="assessment-${field}"></div></div>`; }); };
    assessSelect.addEventListener('change', updateAssessFields);
    assessGenderSelect.addEventListener('change', updateAssessFields);
    calcAssessBtn.addEventListener('click', () => { const pF = ['assessment-name', 'assessment-age', 'assessment-weight', 'assessment-height'], mK = assessSelect.value, gender = assessGenderSelect.value, method = allMethods[mK]; const mFIds = ((method.f_male && gender === 'male') ? method.f_male : (method.f_female && gender === 'female') ? method.f_female : method.f).map(f => `assessment-${f}`); if (!validateFields([...pF, ...mFIds])) return; const pD = { name: document.getElementById('assessment-name').value, age: parseInt(document.getElementById('assessment-age').value), gender, weight: parseFloat(document.getElementById('assessment-weight').value), height: parseFloat(document.getElementById('assessment-height').value) }, m = {}; mFIds.forEach(id => { const key = id.replace('assessment-', ''); m[key] = parseFloat(document.getElementById(id).value); }); let bodyFat = 0; const sum = Object.values(m).reduce((a, b) => a + b, 0); switch (mK) { case 'pollock3': { let dc = pD.gender === 'male' ? 1.10938 - 0.0008267 * sum + 0.0000016 * (sum ** 2) - 0.0002574 * pD.age : 1.0994921 - 0.0009929 * sum + 0.0000023 * (sum ** 2) - 0.0001392 * pD.age; bodyFat = siri(dc); break; } case 'pollock4': bodyFat = siri(1.1599 - 0.0717 * Math.log10(sum)); break; case 'pollock7': { let dc = pD.gender === 'male' ? 1.112 - 0.00043499 * sum + 0.00000055 * (sum ** 2) - 0.00028826 * pD.age : 1.097 - 0.00046971 * sum + 0.00000056 * (sum ** 2) - 0.00012828 * pD.age; bodyFat = siri(dc); break; } case 'durnin': { const logSum = Math.log10(sum); let dc = 0; if (pD.gender === 'male') { if (pD.age <= 19) dc = 1.1620 - 0.0630 * logSum; else if (pD.age <= 29) dc = 1.1631 - 0.0632 * logSum; else if (pD.age <= 39) dc = 1.1422 - 0.0544 * logSum; else if (pD.age <= 49) dc = 1.1620 - 0.0700 * logSum; else dc = 1.1715 - 0.0779 * logSum; } else { if (pD.age <= 19) dc = 1.1549 - 0.0678 * logSum; else if (pD.age <= 29) dc = 1.1599 - 0.0717 * logSum; else if (pD.age <= 39) dc = 1.1423 - 0.0632 * logSum; else if (pD.age <= 49) dc = 1.1333 - 0.0612 * logSum; else dc = 1.1339 - 0.0645 * logSum; } bodyFat = siri(dc); break; } case 'faulkner': bodyFat = 0.153 * sum + 5.783; break; case 'slaughter': { if(pD.gender === 'male') { bodyFat = sum <= 35 ? 1.21 * sum - 0.008 * (sum ** 2) - 1.7 : 0.783 * sum + 1.6; } else { bodyFat = sum <= 35 ? 1.33 * sum - 0.013 * (sum ** 2) - 2.5 : 0.546 * sum + 9.7; } break; } case 'guedes': bodyFat = siri(1.1714 - 0.0671 * Math.log10(sum)); break; } const c = getBodyFatClassification(bodyFat, pD.gender), rC = document.getElementById('assessment-result-container'); document.getElementById('assessment-bodyfat-value').textContent = `${bodyFat.toFixed(2)}%`; document.getElementById('assessment-bodyfat-classification').textContent = c; document.getElementById('summary-name').textContent = pD.name; document.getElementById('summary-date').textContent = new Date().toLocaleDateString('pt-BR'); document.getElementById('summary-method').textContent = allMethods[mK].l; document.getElementById('summary-imc').textContent = calculateBMI(pD.weight, pD.height).toFixed(1); const mL = document.getElementById('summary-measurements'); mL.innerHTML = ''; Object.entries(m).forEach(([k, v]) => { const li = document.createElement('li'); li.innerHTML = `<strong>${fLabels[k]}:</strong> ${v} mm`; mL.appendChild(li) }); rC.style.display = 'block'; saveAssessBtn.style.display = 'block'; rC.dataset.assessment = JSON.stringify({ personalData: pD, measurements: m, results: { bodyFat, classification: c, method: allMethods[mK].l } }); });
    saveAssessBtn.addEventListener('click', () => { const a = JSON.parse(document.getElementById('assessment-result-container').dataset.assessment || '{}'); if (!a.personalData) return; const e = { date: new Date().toISOString(), weight: a.personalData.weight, imc: calculateBMI(a.personalData.weight, a.personalData.height).toFixed(1), bodyFat: a.results.bodyFat.toFixed(2) }; saveHistory(e); showToast('Avaliação salva com sucesso!') });

    // --- Histórico e Gráfico ---
    const getHistory = () => JSON.parse(localStorage.getItem('nutriCalcHistory')) || [];
    const saveHistory = (e) => { const h = getHistory(); h.push(e); localStorage.setItem('nutriCalcHistory', JSON.stringify(h)); };
    const deleteHistoryEntry = (i) => { let h = getHistory(); h.splice(i, 1); localStorage.setItem('nutriCalcHistory', JSON.stringify(h)); renderHistory(); showToast('Avaliação excluída.', 'error'); };
    let progressChart = null;
    const renderHistory = () => { const history = getHistory().sort((a, b) => new Date(a.date) - new Date(b.date)); const tableBody = document.querySelector("#history-table tbody"), noHistoryMsg = document.getElementById('no-history-message'); tableBody.innerHTML = ''; noHistoryMsg.style.display = history.length === 0 ? 'block' : 'none'; if (progressChart) progressChart.destroy(); if (history.length === 0) return; history.forEach((entry, index) => { tableBody.insertRow().innerHTML = `<td>${new Date(entry.date).toLocaleDateString('pt-BR')}</td><td>${entry.weight}</td><td>${entry.imc}</td><td>${entry.bodyFat}%</td><td><button class="delete-btn-icon" data-index="${index}" title="Excluir Avaliação"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button></td>`; }); document.querySelectorAll('.delete-btn-icon').forEach(btn => { btn.addEventListener('click', (e) => deleteHistoryEntry(parseInt(e.currentTarget.dataset.index))); }); const ctx = document.getElementById('progress-chart').getContext('2d'); const createGradient = (c) => { const g = ctx.createLinearGradient(0, 0, 0, 300); g.addColorStop(0, `${c}40`); g.addColorStop(1, `${c}00`); return g; }; progressChart = new Chart(ctx, { type: 'line', data: { labels: history.map(e => new Date(e.date).toLocaleDateString('pt-BR')), datasets: [{ label: 'Peso (kg)', data: history.map(e => e.weight), borderColor: getCssVariable('--cor-primaria'), backgroundColor: createGradient(getCssVariable('--cor-primaria')), fill: true, pointBackgroundColor: '#fff', pointBorderColor: getCssVariable('--cor-primaria'), pointHoverRadius: 7, pointHoverBorderWidth: 2, tension: 0.2 }, { label: 'IMC', data: history.map(e => e.imc), borderColor: getCssVariable('--cor-secundaria'), backgroundColor: createGradient(getCssVariable('--cor-secundaria')), fill: true, pointBackgroundColor: '#fff', pointBorderColor: getCssVariable('--cor-secundaria'), pointHoverRadius: 7, pointHoverBorderWidth: 2, tension: 0.2 }, { label: '% Gordura', data: history.map(e => e.bodyFat), borderColor: getCssVariable('--cor-gordura'), backgroundColor: createGradient(getCssVariable('--cor-gordura')), fill: true, pointBackgroundColor: '#fff', pointBorderColor: getCssVariable('--cor-gordura'), pointHoverRadius: 7, pointHoverBorderWidth: 2, tension: 0.2 }] }, options: { responsive: true, interaction: { intersect: false, mode: 'index' }, plugins: { title: { display: true, text: 'Sua Evolução', font: { size: 18 } }, tooltip: { backgroundColor: '#fff', titleColor: '#333', bodyColor: '#666', borderColor: '#ddd', borderWidth: 1, padding: 10, usePointStyle: true } } } }); };

    // --- PDF e Spinner ---
document.getElementById('download-pdf').addEventListener('click', async () => {
    const spinner = document.getElementById('loading-spinner');
    spinner.style.display = 'flex';

    try {
        const assessment = JSON.parse(document.getElementById('assessment-result-container').dataset.assessment || '{}');
        if (!assessment.personalData) return;

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'pt', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();

        // Cabeçalho
        pdf.setFillColor(getCssVariable('--cor-primaria'));
        pdf.rect(0, 0, pageWidth, 80, 'F');
        pdf.setFontSize(26);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(255, 255, 255);
        pdf.text('Relatório de Avaliação Física', 40, 50);

        // Função para desenhar título das seções com linha
        const drawSectionTitle = (title, y) => {
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(14);
            pdf.setTextColor(getCssVariable('--cor-primaria'));
            pdf.text(title, 40, y);
            pdf.setDrawColor(getCssVariable('--cor-primaria'));
            pdf.setLineWidth(1);
            pdf.line(40, y + 4, pageWidth - 40, y + 4);
        };

        // Dados Pessoais
        drawSectionTitle('Dados Pessoais', 110);
        const personalDataBody = [
            ['Nome', assessment.personalData.name],
            ['Idade', `${assessment.personalData.age} anos`],
            ['Sexo', assessment.personalData.gender === 'male' ? 'Masculino' : 'Feminino'],
            ['Peso', `${assessment.personalData.weight} kg`],
            ['Altura', `${assessment.personalData.height} cm`],
            ['Data', new Date().toLocaleDateString('pt-BR')]
        ];
        pdf.autoTable({
            startY: 125,
            theme: 'striped',
            styles: { fontSize: 11, halign: 'left', valign: 'middle' },
            head: [['Informações do Aluno(a)', '']],
            body: personalDataBody,
            headStyles: { fillColor: getCssVariable('--cor-primaria'), textColor: 255, fontStyle: 'bold' },
            bodyStyles: { fontStyle: 'bold' }
        });

        // Resultados
        const fatMass = assessment.personalData.weight * (assessment.results.bodyFat / 100);
        const leanMass = assessment.personalData.weight - fatMass;
        drawSectionTitle('Resultados da Avaliação', pdf.autoTable.previous.finalY + 25);
        const resultsBody = [
            ['Método Utilizado', assessment.results.method],
            ['Percentual de Gordura', `${assessment.results.bodyFat.toFixed(2)}%`],
            ['Classificação', assessment.results.classification],
            ['Massa Adiposa (Gordura)', `${fatMass.toFixed(2)} kg`],
            ['Massa Magra', `${leanMass.toFixed(2)} kg`]
        ];
        pdf.autoTable({
            startY: pdf.autoTable.previous.finalY + 40,
            theme: 'striped',
            styles: { fontSize: 11, halign: 'left' },
            head: [['Informações da Avaliação', '']],
            body: resultsBody,
            headStyles: { fillColor: getCssVariable('--cor-primaria'), textColor: 255, fontStyle: 'bold' },
            bodyStyles: { fontStyle: 'bold' }
        });

        // Medidas
        drawSectionTitle('Medidas Coletadas (Dobras)', pdf.autoTable.previous.finalY + 25);
        pdf.autoTable({
            startY: pdf.autoTable.previous.finalY + 40,
            theme: 'striped',
            styles: { fontSize: 11 },
            head: [['Dobra', 'milímetro']],
            body: Object.entries(assessment.measurements).map(([key, value]) => [fLabels[key], value]),
            headStyles: { fillColor: getCssVariable('--cor-primaria'), textColor: 255, fontStyle: 'bold' },
            bodyStyles: { fontStyle: 'bold' }
        });

        // Salva o PDF
        pdf.save(`Avaliação Física | ${assessment.personalData.name}.pdf`);
    } finally {
        spinner.style.display = 'none';
    }
});


    // --- INICIALIZAÇÃO ---
    assessSelect.value = 'pollock7';
    updateAssessFields();
    validateMacroInputs();
});