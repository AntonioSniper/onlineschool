class StudentPortal {
    constructor() {
        this.currentStudent = null;
        this.currentCourseId = null;
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
        this.initializeData();
    }

    checkAuth() {
        const student = JSON.parse(localStorage.getItem('currentStudent'));
        if (student) {
            this.currentStudent = student;
            this.showDashboard();
            this.loadStudentData();
        }
    }

    setupEventListeners() {
        // Форма входа
        document.getElementById('studentLoginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Форма регистрации
        document.getElementById('studentRegisterForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });

        // Форма оплаты
        document.getElementById('paymentForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.processPayment();
        });
    }

    initializeData() {
        if (!localStorage.getItem('students')) {
            localStorage.setItem('students', JSON.stringify([]));
        }
        if (!localStorage.getItem('orders')) {
            localStorage.setItem('orders', JSON.stringify([]));
        }
    }

    showTab(tabName) {
        // Скрыть все табы
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        
        // Убрать активный класс у кнопок
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Показать выбранный таб
        document.getElementById(tabName + 'Form').classList.add('active');
        document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');
    }

    showAuth() {
        document.getElementById('authContainer').style.display = 'block';
        document.getElementById('studentDashboard').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('studentDashboard').style.display = 'block';
    }

    login() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Очистка ошибок
        this.clearAuthErrors();
        
        // Валидация
        let isValid = true;
        
        if (!email) {
            this.showAuthError('loginEmailError', 'Email обязателен');
            isValid = false;
        }
        
        if (!password) {
            this.showAuthError('loginPasswordError', 'Пароль обязателен');
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Проверка в базе данных
        const students = JSON.parse(localStorage.getItem('students')) || [];
        const student = students.find(s => s.email === email && s.password === password);
        
        if (student) {
            this.currentStudent = student;
            localStorage.setItem('currentStudent', JSON.stringify(student));
            this.showDashboard();
            this.loadStudentData();
            this.showToast('Успешный вход!', 'success');
        } else {
            this.showAuthError('loginEmailError', 'Неверный email или пароль');
        }
    }

    register() {
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        
        // Очистка ошибок
        this.clearAuthErrors();
        
        // Валидация
        let isValid = true;
        
        if (!email) {
            this.showAuthError('regEmailError', 'Email обязателен');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showAuthError('regEmailError', 'Неверный формат email');
            isValid = false;
        }
        
        if (!password) {
            this.showAuthError('regPasswordError', 'Пароль обязателен');
            isValid = false;
        } else if (!this.isValidPassword(password)) {
            this.showAuthError('regPasswordError', 'Пароль не соответствует требованиям');
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Проверка уникальности email
        const students = JSON.parse(localStorage.getItem('students')) || [];
        if (students.some(s => s.email === email)) {
            this.showAuthError('regEmailError', 'Email уже зарегистрирован');
            return;
        }
        
        // Создание нового студента
        const newStudent = {
            id: Math.max(0, ...students.map(s => s.id)) + 1,
            name: name || email.split('@')[0],
            email: email,
            password: password,
            created_at: new Date().toISOString()
        };
        
        students.push(newStudent);
        localStorage.setItem('students', JSON.stringify(students));
        
        // Автоматический вход
        this.currentStudent = newStudent;
        localStorage.setItem('currentStudent', JSON.stringify(newStudent));
        this.showDashboard();
        this.loadStudentData();
        this.showToast('Регистрация успешна!', 'success');
    }

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    isValidPassword(password) {
        // Минимум 3 символа, заглавные и строчные буквы, цифры, спецсимволы
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_#!%])/;
        return password.length >= 3 && re.test(password);
    }

    logoutStudent() {
        this.currentStudent = null;
        localStorage.removeItem('currentStudent');
        this.showAuth();
        this.showTab('login');
    }

    loadStudentData() {
        if (!this.currentStudent) return;
        
        // Обновление информации в шапке
        document.getElementById('studentName').textContent = this.currentStudent.name;
        document.getElementById('studentEmail').textContent = this.currentStudent.email;
        document.getElementById('profileName').textContent = this.currentStudent.name;
        document.getElementById('profileEmail').textContent = this.currentStudent.email;
        
        // Загрузка данных профиля
        this.loadProfileData();
        
        // Загрузка моих курсов
        this.loadMyCourses();
        
        // Загрузка всех курсов
        this.loadAllCourses();
        
        // Загрузка сертификатов
        this.loadStudentCertificates();
    }

    loadProfileData() {
        if (!this.currentStudent) return;
        
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const myOrders = orders.filter(o => o.user_id === this.currentStudent.id);
        const certificates = myOrders.filter(o => o.certificate_number).length;
        
        // Подсчет часов
        const courses = JSON.parse(localStorage.getItem('courses')) || [];
        let totalHours = 0;
        myOrders.forEach(order => {
            const course = courses.find(c => c.id === order.course_id);
            if (course) totalHours += course.hours;
        });
        
        document.getElementById('profileCourses').textContent = myOrders.length;
        document.getElementById('profileCerts').textContent = certificates;
        document.getElementById('profileHours').textContent = totalHours;
        
        const joinDate = new Date(this.currentStudent.created_at);
        document.getElementById('profileJoinDate').textContent = 
            joinDate.toLocaleDateString('ru-RU');
    }

    loadMyCourses() {
        if (!this.currentStudent) return;
        
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const myOrders = orders.filter(o => o.user_id === this.currentStudent.id);
        const courses = JSON.parse(localStorage.getItem('courses')) || [];
        const container = document.getElementById('myCoursesGrid');
        
        if (myOrders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open"></i>
                    <h3>У вас нет курсов</h3>
                    <p>Запишитесь на свой первый курс!</p>
                    <button onclick="showStudentTab('all-courses')" class="btn btn-primary">
                        <i class="fas fa-search"></i> Найти курсы
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = myOrders.map(order => {
            const course = courses.find(c => c.id === order.course_id);
            if (!course) return '';
            
            return `
                <div class="my-course-card">
                    <div class="course-image">
                        <img src="${course.thumbnail || course.image}" alt="${course.name}">
                        <span class="course-status ${order.payment_status}">
                            ${this.getStatusText(order.payment_status)}
                        </span>
                    </div>
                    <div class="course-content">
                        <h3>${course.name}</h3>
                        <p>${course.description}</p>
                        <div class="course-progress">
                            <div class="progress-bar">
                                <div class="progress" style="width: ${order.payment_status === 'success' ? '100' : '0'}%"></div>
                            </div>
                            <span>${order.payment_status === 'success' ? 'Доступен' : 'Ожидает оплаты'}</span>
                        </div>
                        <div class="course-meta">
                            <span><i class="far fa-clock"></i> ${course.hours} ч</span>
                            <span><i class="far fa-calendar-alt"></i> ${course.start_date} - ${course.end_date}</span>
                        </div>
                        <div class="course-actions">
                            ${order.payment_status === 'success' ? `
                                <button onclick="student.startCourse(${course.id})" class="btn btn-primary">
                                    <i class="fas fa-play"></i> Начать обучение
                                </button>
                            ` : `
                                <button onclick="student.completePayment(${order.id})" class="btn btn-primary">
                                    <i class="fas fa-credit-card"></i> Оплатить
                                </button>
                            `}
                            ${order.canBeCancelled ? `
                                <button onclick="student.cancelEnrollment(${order.id})" class="btn btn-outline">
                                    <i class="fas fa-times"></i> Отменить
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    loadAllCourses() {
        const courses = JSON.parse(localStorage.getItem('courses')) || [];
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const container = document.getElementById('allCoursesGrid');
        
        const enrolledCourseIds = orders
            .filter(o => o.user_id === this.currentStudent?.id)
            .map(o => o.course_id);
        
        container.innerHTML = courses.map(course => {
            const isEnrolled = enrolledCourseIds.includes(course.id);
            const order = orders.find(o => 
                o.user_id === this.currentStudent?.id && o.course_id === course.id
            );
            
            return `
                <div class="course-card">
                    <div class="course-image">
                        <img src="${course.thumbnail || course.image}" alt="${course.name}">
                        <span class="course-price">${course.price.toLocaleString()} ₽</span>
                    </div>
                    <div class="course-content">
                        <h3>${course.name}</h3>
                        <p>${course.description}</p>
                        <div class="course-meta">
                            <span><i class="far fa-clock"></i> ${course.hours} ч</span>
                            <span><i class="far fa-calendar-alt"></i> ${course.start_date} - ${course.end_date}</span>
                        </div>
                        ${isEnrolled ? `
                            <div class="enrolled-badge">
                                <i class="fas fa-check-circle"></i> Записан
                            </div>
                            <div class="course-actions">
                                <button class="btn btn-outline" disabled>
                                    Уже записан
                                </button>
                            </div>
                        ` : `
                            <div class="course-actions">
                                <button onclick="student.enrollCourse(${course.id})" class="btn btn-primary">
                                    <i class="fas fa-shopping-cart"></i> Записаться
                                </button>
                            </div>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    }

    searchCourses() {
        const searchTerm = document.getElementById('courseSearch').value.toLowerCase();
        const courses = JSON.parse(localStorage.getItem('courses')) || [];
        const filteredCourses = courses.filter(course =>
            course.name.toLowerCase().includes(searchTerm) ||
            course.description.toLowerCase().includes(searchTerm)
        );
        
        this.displayCourses(filteredCourses);
    }

    enrollCourse(courseId) {
        if (!this.currentStudent) {
            this.showToast('Сначала войдите в систему', 'error');
            return;
        }
        
        // Проверка дат курса
        const courses = JSON.parse(localStorage.getItem('courses')) || [];
        const course = courses.find(c => c.id === courseId);
        
        if (!course) return;
        
        const today = new Date();
        const startDate = this.parseDate(course.start_date);
        
        if (today > startDate) {
            this.showToast('Курс уже начался', 'error');
            return;
        }
        
        // Проверка существующей записи
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const existingOrder = orders.find(o => 
            o.user_id === this.currentStudent.id && o.course_id === courseId
        );
        
        if (existingOrder) {
            this.showToast('Вы уже записаны на этот курс', 'error');
            return;
        }
        
        // Создание заказа
        const newOrder = {
            id: Math.max(0, ...orders.map(o => o.id)) + 1,
            user_id: this.currentStudent.id,
            course_id: courseId,
            payment_status: 'pending',
            order_id: 'ORD' + Date.now(),
            enrolled_at: new Date().toISOString(),
            certificate_number: null
        };
        
        orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Показ формы оплаты
        this.showPaymentModal(courseId);
        
        this.showToast('Заявка на запись создана!', 'success');
        this.loadMyCourses();
        this.loadAllCourses();
    }

    showPaymentModal(courseId) {
        this.currentCourseId = courseId;
        const courses = JSON.parse(localStorage.getItem('courses')) || [];
        const course = courses.find(c => c.id === courseId);
        
        if (!course) return;
        
        document.getElementById('paymentCourse').innerHTML = `
            <h4>${course.name}</h4>
            <div class="payment-details">
                <p><i class="far fa-clock"></i> ${course.hours} часов</p>
                <p><i class="far fa-calendar-alt"></i> ${course.start_date} - ${course.end_date}</p>
                <p class="payment-amount">
                    <i class="fas fa-ruble-sign"></i>
                    <strong>${course.price.toLocaleString()} ₽</strong>
                </p>
            </div>
        `;
        
        document.getElementById('paymentModal').style.display = 'flex';
    }

    closePaymentModal() {
        document.getElementById('paymentModal').style.display = 'none';
        this.currentCourseId = null;
    }

    processPayment() {
        if (!this.currentCourseId || !this.currentStudent) return;
        
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        
        // Определение статуса оплаты
        let status;
        if (cardNumber === '8888000000001111') {
            status = 'success';
        } else if (cardNumber === '8888000000002222') {
            status = 'failed';
        } else {
            status = 'failed';
        }
        
        // Обновление заказа
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const order = orders.find(o => 
            o.user_id === this.currentStudent.id && 
            o.course_id === this.currentCourseId
        );
        
        if (order) {
            order.payment_status = status;
            localStorage.setItem('orders', JSON.stringify(orders));
        }
        
        // Закрытие модального окна
        this.closePaymentModal();
        
        // Обновление данных
        this.loadMyCourses();
        this.loadAllCourses();
        
        // Показ результата
        if (status === 'success') {
            this.showToast('Оплата успешна! Курс доступен для обучения.', 'success');
        } else {
            this.showToast('Оплата не удалась. Попробуйте снова.', 'error');
        }
    }

    completePayment(orderId) {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const order = orders.find(o => o.id === orderId);
        
        if (order) {
            this.showPaymentModal(order.course_id);
        }
    }

    cancelEnrollment(orderId) {
        if (!confirm('Вы уверены, что хотите отменить запись на курс?')) return;
        
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const orderIndex = orders.findIndex(o => o.id === orderId);
        
        if (orderIndex !== -1) {
            const order = orders[orderIndex];
            
            // Проверка возможности отмены
            if (order.payment_status === 'success') {
                this.showToast('Нельзя отменить оплаченный курс', 'error');
                return;
            }
            
            orders.splice(orderIndex, 1);
            localStorage.setItem('orders', JSON.stringify(orders));
            
            this.loadMyCourses();
            this.loadAllCourses();
            this.showToast('Запись отменена', 'success');
        }
    }

    startCourse(courseId) {
        const courses = JSON.parse(localStorage.getItem('courses')) || [];
        const course = courses.find(c => c.id === courseId);
        
        if (course) {
            this.showToast(`Начинаем курс "${course.name}"!`, 'success');
            // Здесь можно добавить переход на страницу уроков
        }
    }

    loadStudentCertificates() {
        if (!this.currentStudent) return;
        
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const myCertificates = orders.filter(o => 
            o.user_id === this.currentStudent.id && 
            o.certificate_number
        );
        
        const container = document.getElementById('studentCertificates');
        
        if (myCertificates.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-certificate"></i>
                    <h3>У вас пока нет сертификатов</h3>
                    <p>Завершите оплаченные курсы, чтобы получить сертификаты</p>
                </div>
            `;
            return;
        }
        
        const courses = JSON.parse(localStorage.getItem('courses')) || [];
        
        container.innerHTML = myCertificates.map(order => {
            const course = courses.find(c => c.id === order.course_id);
            
            return `
                <div class="certificate-card">
                    <div class="certificate-header">
                        <i class="fas fa-certificate"></i>
                        <div>
                            <h4>Сертификат № ${order.certificate_number}</h4>
                            <p>${course?.name || 'Курс'}</p>
                        </div>
                    </div>
                    <div class="certificate-info">
                        <p><i class="far fa-calendar-alt"></i> Выдан: 
                           ${new Date(order.enrolled_at).toLocaleDateString('ru-RU')}</p>
                        <p><i class="far fa-clock"></i> Продолжительность: ${course?.hours || 0} часов</p>
                    </div>
                    <div class="certificate-actions">
                        <button onclick="window.open('certificate.html?number=${order.certificate_number}&student=${this.currentStudent.id}', '_blank')" 
                                class="btn btn-outline">
                            <i class="fas fa-eye"></i> Просмотр
                        </button>
                        <button onclick="student.verifyCertificate('${order.certificate_number}')" 
                                class="btn btn-primary">
                            <i class="fas fa-check-circle"></i> Проверить
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    verifyCertificate(certificateNumber) {
        // Проверка сертификата
        const lastDigit = certificateNumber.slice(-1);
        const isValid = lastDigit === '1';
        
        if (isValid) {
            this.showToast('Сертификат действителен!', 'success');
        } else {
            this.showToast('Сертификат недействителен!', 'error');
        }
    }

    getStatusText(status) {
        const statusMap = {
            'pending': 'Ожидает оплаты',
            'success': 'Оплачено',
            'failed': 'Ошибка оплаты'
        };
        return statusMap[status] || status;
    }

    parseDate(dateString) {
        const [day, month, year] = dateString.split('-');
        return new Date(year, month - 1, day);
    }

    showAuthError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
        }
    }

    clearAuthErrors() {
        document.querySelectorAll('#authContainer .error-message').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    showStudentTab(tabId) {
        // Скрыть все табы
        document.querySelectorAll('.student-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Убрать активный класс у кнопок
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Показать выбранный таб
        document.getElementById(tabId).classList.add('active');
        document.querySelector(`[onclick="showStudentTab('${tabId}')"]`).classList.add('active');
        
        // Загрузить данные если нужно
        if (tabId === 'all-courses') {
            this.loadAllCourses();
        } else if (tabId === 'certificates') {
            this.loadStudentCertificates();
        }
    }
}

// Глобальная переменная
const student = new StudentPortal();

// Глобальные функции
function showTab(tabName) {
    student.showTab(tabName);
}

function logoutStudent() {
    student.logoutStudent();
}

function showStudentTab(tabId) {
    student.showStudentTab(tabId);
}

function searchCourses() {
    student.searchCourses();
}

function closePaymentModal() {
    student.closePaymentModal();
}