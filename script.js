// المتغيرات العامة
let currentPage = 1;
const itemsPerPage = 10;
let filteredData = [...indicatorsData];

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// وظيفة تهيئة التطبيق
function initializeApp() {
    renderStatsCards();
    renderIndicatorsTable();
    setupEventListeners();
    renderCharts();
}

// عرض بطاقات الإحصائيات
function renderStatsCards() {
    const statsContainer = document.getElementById('stats-cards');
    
    // حساب الإحصائيات
    const totalIndicators = indicatorsData.length;
    const producedIndicators = indicatorsData.filter(item => item.productionStatus === 'تم الإنتاج').length;
    const reviewNeeded = indicatorsData.filter(item => item.productionStatus === 'يحتاج إلى مراجعة / عليه ملاحظات').length;
    const highRating = indicatorsData.filter(item => item.rating === '☆☆☆☆☆').length;
    
    const stats = [
        { title: 'إجمالي المؤشرات', value: totalIndicators, icon: 'fas fa-chart-bar', color: 'primary' },
        { title: 'المؤشرات المنتجة', value: producedIndicators, icon: 'fas fa-check-circle', color: 'success' },
        { title: 'تحتاج مراجعة', value: reviewNeeded, icon: 'fas fa-exclamation-triangle', color: 'warning' },
        { title: 'ممتاز (5 نجوم)', value: highRating, icon: 'fas fa-star', color: 'info' }
    ];
    
    let statsHTML = '';
    stats.forEach(stat => {
        statsHTML += `
            <div class="col-md-3 col-sm-6">
                <div class="card stats-card border-${stat.color}">
                    <div class="card-body text-center">
                        <div class="stats-icon text-${stat.color}">
                            <i class="${stat.icon}"></i>
                        </div>
                        <div class="stats-value text-${stat.color}">${stat.value}</div>
                        <div class="stats-label">${stat.title}</div>
                    </div>
                </div>
            </div>
        `;
    });
    
    statsContainer.innerHTML = statsHTML;
}

// عرض جدول المؤشرات
function renderIndicatorsTable() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredData.slice(startIndex, endIndex);
    
    const tableBody = document.getElementById('indicators-body');
    let tableHTML = '';
    
    if (currentData.length === 0) {
        tableHTML = `
            <tr>
                <td colspan="8" class="text-center py-4">
                    <i class="fas fa-search fa-2x text-muted mb-2"></i>
                    <p class="text-muted">لا توجد نتائج مطابقة لبحثك</p>
                </td>
            </tr>
        `;
    } else {
        currentData.forEach(indicator => {
            tableHTML += `
                <tr>
                    <td>${indicator.code}</td>
                    <td>${indicator.name}</td>
                    <td>${truncateText(indicator.definition, 50)}</td>
                    <td>${truncateText(removeHtmlTags(indicator.calculationMethod), 50)}</td>
                    <td>${indicator.unit}</td>
                    <td><span class="badge ${getStatusBadgeClass(indicator.productionStatus)}">${indicator.productionStatus}</span></td>
                    <td><span class="rating-stars">${indicator.rating}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary btn-action" onclick="showIndicatorDetails('${indicator.code}')">
                            <i class="fas fa-eye"></i> عرض
                        </button>
                    </td>
                </tr>
            `;
        });
    }
    
    tableBody.innerHTML = tableHTML;
    updatePagination();
    updateResultsCount();
}

// إزالة وسوم HTML من النص
function removeHtmlTags(text) {
    return text.replace(/<[^>]*>/g, '');
}

// تقصير النص الطويل
function truncateText(text, maxLength) {
    if (!text) return '';
    const cleanText = removeHtmlTags(text);
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength) + '...';
}

// الحصول على فئة Badge بناءً على حالة الإنتاج
function getStatusBadgeClass(status) {
    switch(status) {
        case 'تم الإنتاج':
            return 'bg-success';
        case 'يحتاج إلى مراجعة / عليه ملاحظات':
            return 'bg-warning';
        default:
            return 'bg-secondary';
    }
}

// تحديث أرقام الصفحات
function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginationContainer = document.getElementById('pagination');
    let paginationHTML = '';
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    // زر الصفحة السابقة
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">السابق</a>
        </li>
    `;
    
    // أرقام الصفحات
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
            </li>
        `;
    }
    
    // زر الصفحة التالية
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">التالي</a>
        </li>
    `;
    
    paginationContainer.innerHTML = paginationHTML;
}

// تغيير الصفحة
function changePage(page) {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderIndicatorsTable();
    
    // التمرير إلى أعلى الجدول
    document.getElementById('indicators').scrollIntoView({ behavior: 'smooth' });
}

// تحديث عدد النتائج
function updateResultsCount() {
    const total = filteredData.length;
    if (total === 0) {
        document.getElementById('results-count').textContent = `عرض 0 من 0 نتيجة`;
        return;
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, total);
    
    document.getElementById('results-count').textContent = `عرض ${startIndex}-${endIndex} من ${total} نتيجة`;
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // البحث
    document.getElementById('search-input').addEventListener('input', function() {
        applyFilters();
    });
    
    // تصفية حسب حالة الإنتاج
    document.getElementById('status-filter').addEventListener('change', function() {
        applyFilters();
    });
    
    // تصفية حسب التقييم
    document.getElementById('rating-filter').addEventListener('change', function() {
        applyFilters();
    });
}

// تطبيق الفلاتر
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    const ratingFilter = document.getElementById('rating-filter').value;
    
    filteredData = indicatorsData.filter(indicator => {
        // البحث
        const matchesSearch = 
            indicator.code.toLowerCase().includes(searchTerm) ||
            indicator.name.toLowerCase().includes(searchTerm) ||
            (indicator.definition && indicator.definition.toLowerCase().includes(searchTerm)) ||
            (indicator.calculationMethod && removeHtmlTags(indicator.calculationMethod).toLowerCase().includes(searchTerm));
        
        // تصفية حسب الحالة
        const matchesStatus = statusFilter === '' || indicator.productionStatus === statusFilter;
        
        // تصفية حسب التقييم
        let matchesRating = true;
        if (ratingFilter !== '') {
            const starCount = (indicator.rating || '').length;
            matchesRating = starCount.toString() === ratingFilter;
        }
        
        return matchesSearch && matchesStatus && matchesRating;
    });
    
    currentPage = 1;
    renderIndicatorsTable();
}

// عرض تفاصيل المؤشر
function showIndicatorDetails(code) {
    const indicator = indicatorsData.find(item => item.code === code);
    if (!indicator) return;
    
    document.getElementById('modalTitle').textContent = `${indicator.code} - ${indicator.name}`;
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="indicator-detail-item">
            <div class="indicator-detail-label">تعريف المؤشر:</div>
            <div class="indicator-detail-value">${indicator.definition || 'غير متوفر'}</div>
        </div>
        <div class="indicator-detail-item">
            <div class="indicator-detail-label">طريقة الحساب:</div>
            <div class="indicator-detail-value">${indicator.calculationMethod || 'غير متوفر'}</div>
        </div>
        <div class="indicator-detail-item">
            <div class="indicator-detail-label">وحدة القياس:</div>
            <div class="indicator-detail-value">${indicator.unit || 'غير متوفر'}</div>
        </div>
        <div class="indicator-detail-item">
            <div class="indicator-detail-label">المرجعيات:</div>
            <div class="indicator-detail-value">${indicator.references || 'غير متوفر'}</div>
        </div>
        <div class="indicator-detail-item">
            <div class="indicator-detail-label">مصدر البيانات:</div>
            <div class="indicator-detail-value">${indicator.dataSource || 'غير متوفر'}</div>
        </div>
        <div class="indicator-detail-item">
            <div class="indicator-detail-label">نوع مصدر البيانات:</div>
            <div class="indicator-detail-value">${indicator.dataSourceType || 'غير متوفر'}</div>
        </div>
        <div class="indicator-detail-item">
            <div class="indicator-detail-label">الحيز الجغرافي:</div>
            <div class="indicator-detail-value">${indicator.geographicalScope || 'غير متوفر'}</div>
        </div>
        <div class="indicator-detail-item">
            <div class="indicator-detail-label">حالة الإنتاج:</div>
            <div class="indicator-detail-value"><span class="badge ${getStatusBadgeClass(indicator.productionStatus)}">${indicator.productionStatus || 'غير متوفر'}</span></div>
        </div>
        <div class="indicator-detail-item">
            <div class="indicator-detail-label">التقييم:</div>
            <div class="indicator-detail-value"><span class="rating-stars">${indicator.rating || 'غير متوفر'}</span></div>
        </div>
        ${indicator.notes ? `
        <div class="indicator-detail-item">
            <div class="indicator-detail-label">ملاحظات:</div>
            <div class="indicator-detail-value">${indicator.notes}</div>
        </div>
        ` : ''}
        <div class="indicator-detail-item">
            <div class="indicator-detail-label">الاسم بالإنجليزية:</div>
            <div class="indicator-detail-value">${indicator.englishName || 'غير متوفر'}</div>
        </div>
        <div class="indicator-detail-item">
            <div class="indicator-detail-label">القطاع:</div>
            <div class="indicator-detail-value">${indicator.sector || 'غير متوفر'}</div>
        </div>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('indicatorModal'));
    modal.show();
}

// عرض المخططات
function renderCharts() {
    // مخطط حالة الإنتاج
    const statusCtx = document.getElementById('statusChart').getContext('2d');
    const statusCounts = {};
    
    indicatorsData.forEach(item => {
        const status = item.productionStatus || 'غير محدد';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    new Chart(statusCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: ['#28a745', '#ffc107', '#dc3545', '#6c757d'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    rtl: true
                }
            }
        }
    });
    
    // مخطط التقييمات
    const ratingCtx = document.getElementById('ratingChart').getContext('2d');
    const ratingCounts = {};
    
    indicatorsData.forEach(item => {
        const rating = item.rating || 'غير محدد';
        ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
    });
    
    new Chart(ratingCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(ratingCounts),
            datasets: [{
                label: 'عدد المؤشرات',
                data: Object.values(ratingCounts),
                backgroundColor: '#17a2b8',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}