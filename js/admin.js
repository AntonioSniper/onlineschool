class AdminPanel {
    constructor() {
        this.currentAdmin = null;
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
        this.loadInitialData();
    }

    checkAuth() {
        const admin = JSON.parse(localStorage.getItem('currentAdmin'));
        if (admin && admin.email === 'admin@edu.com') {
            this.currentAdmin = admin;
            this.showAdminPanel();
        } else {
            this.showLogin();
        }
    }

    setupEventListeners() {
        // Логин форма
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Форма курса
        document.getElementById('courseForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCourse();
        });

        // Форма урока
        document.getElementById('lessonForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveLesson();
        });
    }

    login() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const adminData = JSON.parse(localStorage.getItem('admin'));

        // Очистка ошибок
        this.clearErrors();

        // Валидация
        let isValid = true;

        if (!email) {
            this.showError('emailError', 'Email обязателен');
            isValid = false;
        } else if (email !== adminData.email) {
            this.showError('emailError', 'Неверный email');
            isValid = false;
        }

        if (!password) {
            this.showError('passwordError', 'Пароль обязателен');
            isValid = false;
        } else if (password !== adminData.password) {
            this.showError('passwordError', 'Неверный пароль');
            isValid = false;
        }

        if (isValid) {
            this.currentAdmin = { email, password };
            localStorage.setItem('currentAdmin', JSON.stringify(this.currentAdmin));
            this.showAdminPanel();
            this.loadDashboard();
        }
    }

    logout() {
        this.currentAdmin = null;
        localStorage.removeItem('currentAdmin');
        this.showLogin();
    }

    showLogin() {
        document.getElementById('loginContainer').style.display = 'flex';
        document.getElementById('adminMain').style.display = 'none';
    }

    showAdminPanel() {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('adminMain').style.display = 'flex';
    }

    showSection(sectionId) {
        // Скрыть все секции
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Убрать активный класс у всех пунктов меню
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Показать нужную секцию
        document.getElementById(sectionId).classList.add('active');
        
        // Активировать пункт меню
        document.querySelector(`[onclick="showSection('${sectionId}')"]`).classList.add('active');
        
        // Загрузить данные для секции
        switch(sectionId) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'courses':
                this.loadCourses();
                break;
            case 'lessons':
                this.loadLessons();
                break;
            case 'students':
                this.loadStudents();
                break;
            case 'certificates':
                this.loadCertificates();
                break;
        }
    }

    loadInitialData() {
        // Инициализация данных если их нет
        if (!localStorage.getItem('courses')) {
            const defaultCourses = [
                {
                    id: 1,
                    name: "Веб-разработка с нуля",
                    description: "Научись создавать современные веб-сайты",
                    hours: 120,
                    price: 14900,
                    start_date: "15-01-2024",
                    end_date: "15-04-2024",
                    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                },
                {
                    id: 2,
                    name: "Data Science",
                    description: "Анализ данных и машинное обучение",
                    hours: 160,
                    price: 19900,
                    start_date: "20-01-2024",
                    end_date: "20-05-2024",
                    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                }
            ];
            localStorage.setItem('courses', JSON.stringify(defaultCourses));
        }

        if (!localStorage.getItem('lessons')) {
            const defaultLessons = [
                {
                    id: 1,
                    course_id: 1,
                    title: "Введение в HTML",
                    content: "Основы HTML и структура веб-страницы",
                    video_link: "https://super-tube.cc/video/v23189",
                    duration: 2,
                    order: 1
                },
                {
                    id: 2,
                    course_id: 1,
                    title: "CSS и стилизация",
                    content: "Основы CSS и создание красивых интерфейсов",
                    video_link: "https://super-tube.cc/video/v23190",
                    duration: 3,
                    order: 2
                }
            ];
            localStorage.setItem('lessons', JSON.stringify(defaultLessons));
        }

        if (!localStorage.getItem('students')) {
            const defaultStudents = [
                {
                    id: 1,
                    name: "Иван Иванов",
                    email: "ivan@example.com",
                    password: "Student123!",
                    created_at: new Date().toISOString()
                }
            ];
            localStorage.setItem('students', JSON.stringify(defaultStudents));
        }

        if (!localStorage.getItem('orders')) {
            const defaultOrders = [
                {
                    id: 1,
                    user_id: 1,
                    course_id: 1,
                    payment_status: "success",
                    order_id: "ORD001",
                    enrolled_at: new Date().toISOString(),
                    certificate_number: null
                }
            ];
            localStorage.setItem('orders', JSON.stringify(defaultOrders));
        }
    }

    loadDashboard() {
        const courses = JSON.parse(localStorage.getItem('courses')) || [];
        const students = JSON.parse(localStorage.getItem('students')) || [];
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const certificates = orders.filter(o => o.certificate_number).length;

        document.getElementById('totalCourses').textContent = courses.length;
        document.getElementById('totalStudents').textContent = students.length;
        document.getElementById('totalOrders').textContent = orders.length;
        document.getElementById('totalCertificates').textContent = certificates;

        // Загрузка последних записей
        this.loadRecentOrders(orders.slice(0, 5));
    }

    loadRecentOrders(orders) {
        const container = document.getElementById('recentOrders');
        const courses = JSON.parse(localStorage.getItem('courses')) || [];
        const students = JSON.parse(localStorage.getItem('students')) || [];

        container.innerHTML = orders.map(order => {
            const course = courses.find(c => c.id === order.course_id);
            const student = students.find(s => s.id === order.user_id);
            
            return `
                <div class="recent-order">
                    <div class="order-info">
                        <strong>${student?.name || 'Студент'}</strong>
                        <span>${course?.name || 'Курс'}</span>
                    </div>
                    <div class="order-status">
                        <span class="status-badge ${order.payment_status}">
                            ${this.getStatusText(order.payment_status)}
                        </span>
                        <small>${new Date(order.enrolled_at).toLocaleDateString('ru-RU')}</small>
                    </div>
                </div>
            `;
        }).join('');
    }

    getStatusText(status) {
        const statusMap = {
            'pending': 'Ожидает оплаты',
            'success': 'Оплачено',
            'failed': 'Ошибка оплаты'
        };
        return statusMap[status] || status;
    }

    loadCourses() {
        const courses = JSON.parse(localStorage.getItem('courses')) || [];
        const container = document.getElementById('coursesTable');
        
        container.innerHTML = courses.map(course => `
            <tr>
                <td>${course.id}</td>
                <td>
                    <img src="${course.thumbnail || course.image}" 
                         alt="${course.name}" 
                         class="table-image">
                </td>
                <td>
                    <strong>${course.name}</strong>
                    <small>${course.description}</small>
                </td>
                <td>${course.hours} ч</td>
                <td>${course.price.toLocaleString()} ₽</td>
                <td>
                    ${course.start_date}<br>
                    ${course.end_date}
                </td>
                <td>
                    <div class="action-buttons">
                        <button onclick="admin.editCourse(${course.id})" 
                                class="btn-icon btn-edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="admin.deleteCourse(${course.id})" 
                                class="btn-icon btn-delete">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button onclick="admin.manageLessons(${course.id})" 
                                class="btn-icon btn-lesson">
                            <i class="fas fa-plus"></i> Урок
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    showCourseForm(courseId = null) {
        const modal = document.getElementById('courseModal');
        const title = document.getElementById('modalTitle');
        
        if (courseId) {
            // Редактирование существующего курса
            const courses = JSON.parse(localStorage.getItem('courses')) || [];
            const course = courses.find(c => c.id === courseId);
            
            if (course) {
                document.getElementById('courseId').value = course.id;
                document.getElementById('courseName').value = course.name;
                document.getElementById('courseDescription').value = course.description || '';
                document.getElementById('courseHours').value = course.hours;
                document.getElementById('coursePrice').value = course.price;
                document.getElementById('startDate').value = course.start_date;
                document.getElementById('endDate').value = course.end_date;
                document.getElementById('courseImage').required = false;
                
                title.textContent = 'Редактировать курс';
            }
        } else {
            // Создание нового курса
            document.getElementById('courseId').value = '';
            document.getElementById('courseForm').reset();
            document.getElementById('courseImage').required = true;
            title.textContent = 'Новый курс';
        }
        
        modal.style.display = 'flex';
    }

    saveCourse() {
        const form = document.getElementById('courseForm');
        const courseId = document.getElementById('courseId').value;
        
        // Очистка ошибок
        this.clearCourseErrors();
        
        // Валидация
        let isValid = true;
        const data = {
            name: document.getElementById('courseName').value.trim(),
            description: document.getElementById('courseDescription').value.trim(),
            hours: parseInt(document.getElementById('courseHours').value),
            price: parseFloat(document.getElementById('coursePrice').value),
            start_date: document.getElementById('startDate').value,
            end_date: document.getElementById('endDate').value
        };

        if (!data.name || data.name.length > 30) {
            this.showError('nameError', 'Название обязательно (макс. 30 символов)');
            isValid = false;
        }

        if (data.description.length > 100) {
            this.showError('descError', 'Описание слишком длинное (макс. 100 символов)');
            isValid = false;
        }

        if (!data.hours || data.hours < 1 || data.hours > 10) {
            this.showError('hoursError', 'Продолжительность должна быть от 1 до 10 часов');
            isValid = false;
        }

        if (!data.price || data.price < 100) {
            this.showError('priceError', 'Цена должна быть не менее 100 рублей');
            isValid = false;
        }

        const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
        if (!dateRegex.test(data.start_date)) {
            this.showError('startDateError', 'Формат даты: дд-мм-гггг');
            isValid = false;
        }

        if (!dateRegex.test(data.end_date)) {
            this.showError('endDateError', 'Формат даты: дд-мм-гггг');
            isValid = false;
        }

        const startDate = this.parseDate(data.start_date);
        const endDate = this.parseDate(data.end_date);
        
        if (endDate <= startDate) {
            this.showError('endDateError', 'Дата окончания должна быть позже даты начала');
            isValid = false;
        }

        if (!courseId) {
            // Проверка файла для нового курса
            const fileInput = document.getElementById('courseImage');
            if (!fileInput.files.length) {
                this.showError('imageError', 'Обложка обязательна');
                isValid = false;
            } else {
                const file = fileInput.files[0];
                if (!file.type.match('image/jpeg')) {
                    this.showError('imageError', 'Только JPG/JPEG изображения');
                    isValid = false;
                }
                if (file.size > 2000 * 1024) {
                    this.showError('imageError', 'Максимальный размер 2000 КБ');
                    isValid = false;
                }
            }
        }

        if (!isValid) return;

        // Сохранение курса
        let courses = JSON.parse(localStorage.getItem('courses')) || [];
        
        if (courseId) {
            // Обновление существующего курса
            const index = courses.findIndex(c => c.id === parseInt(courseId));
            if (index !== -1) {
                courses[index] = { ...courses[index], ...data };
            }
        } else {
            // Создание нового курса
            const newId = Math.max(0, ...courses.map(c => c.id)) + 1;
            const imageUrl = "https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";
            
            courses.push({
                id: newId,
                ...data,
                image: imageUrl,
                thumbnail: imageUrl
            });
        }
        
        localStorage.setItem('courses', JSON.stringify(courses));
        this.closeModal();
        this.loadCourses();
        this.showToast('Курс успешно сохранен!', 'success');
    }

    deleteCourse(courseId) {
        if (!confirm('Вы уверены, что хотите удалить этот курс?')) return;
        
        // Проверка на активные записи
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const activeOrders = orders.filter(o => 
            o.course_id === courseId && o.payment_status === 'success'
        );
        
        if (activeOrders.length > 0) {
            this.showToast('Нельзя удалить курс с активными записями!', 'error');
            return;
        }
        
        // Удаление курса
        let courses = JSON.parse(localStorage.getItem('courses')) || [];
        courses = courses.filter(c => c.id !== courseId);
        localStorage.setItem('courses', JSON.stringify(courses));
        
        // Удаление связанных уроков
        let lessons = JSON.parse(localStorage.getItem('lessons')) || [];
        lessons = lessons.filter(l => l.course_id !== courseId);
        localStorage.setItem('lessons', JSON.stringify(lessons));
        
        this.loadCourses();
        this.showToast('Курс удален!', 'success');
    }

    loadLessons() {
        const lessons = JSON.parse(localStorage.getItem('lessons')) || [];
        const courses = JSON.parse(localStorage.getItem('courses')) || [];
        const container = document.getElementById('lessonsGrid');
        
        // Обновление фильтра курсов
        const filter = document.getElementById('courseFilter');
        filter.innerHTML = '<option value="">Все курсы</option>' + 
            courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        
        container.innerHTML = lessons.map(lesson => {
            const course = courses.find(c => c.id === lesson.course_id);
            
            return `
                <div class="lesson-card">
                    <div class="lesson-header">
                        <h4>${lesson.title}</h4>
                        <span class="lesson-duration">${lesson.duration} ч</span>
                    </div>
                    <div class="lesson-content">
                        <p>${lesson.content.substring(0, 100)}...</p>
                        ${lesson.video_link ? `
                            <div class="video-link">
                                <i class="fas fa-video"></i>
                                <a href="${lesson.video_link}" target="_blank">Видеоурок</a>
                            </div>
                        ` : ''}
                    </div>
                    <div class="lesson-footer">
                        <span class="course-badge">${course?.name || 'Курс'}</span>
                        <div class="lesson-actions">
                            <button onclick="admin.editLesson(${lesson.id})" 
                                    class="btn-icon btn-edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="admin.deleteLesson(${lesson.id})" 
                                    class="btn-icon btn-delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    filterLessons() {
        const courseId = document.getElementById('courseFilter').value;
        const lessons = JSON.parse(localStorage.getItem('lessons')) || [];
        const filteredLessons = courseId ? 
            lessons.filter(l => l.course_id === parseInt(courseId)) : 
            lessons;
        
        this.displayLessons(filteredLessons);
    }

    manageLessons(courseId) {
        this.showLessonForm(null, courseId);
        this.showSection('lessons');
    }

    showLessonForm(lessonId = null, courseId = null) {
        const modal = document.getElementById('lessonModal');
        const title = document.getElementById('lessonModalTitle');
        
        if (lessonId) {
            // Редактирование существующего урока
            const lessons = JSON.parse(localStorage.getItem('lessons')) || [];
            const lesson = lessons.find(l => l.id === lessonId);
            
            if (lesson) {
                document.getElementById('lessonId').value = lesson.id;
                document.getElementById('lessonCourseId').value = lesson.course_id;
                document.getElementById('lessonTitle').value = lesson.title;
                document.getElementById('lessonContent').value = lesson.content;
                document.getElementById('lessonVideo').value = lesson.video_link || '';
                document.getElementById('lessonDuration').value = lesson.duration;
                
                title.textContent = 'Редактировать урок';
            }
        } else {
            // Создание нового урока
            document.getElementById('lessonId').value = '';
            document.getElementById('lessonCourseId').value = courseId || '';
            document.getElementById('lessonForm').reset();
            title.textContent = 'Новый урок';
        }
        
        modal.style.display = 'flex';
    }

    saveLesson() {
        // Валидация и сохранение урока
        const form = document.getElementById('lessonForm');
        const lessonId = document.getElementById('lessonId').value;
        const courseId = document.getElementById('lessonCourseId').value;
        
        // Очистка ошибок
        this.clearLessonErrors();
        
        // Валидация
        let isValid = true;
        const data = {
            course_id: parseInt(courseId),
            title: document.getElementById('lessonTitle').value.trim(),
            content: document.getElementById('lessonContent').value.trim(),
            video_link: document.getElementById('lessonVideo').value.trim(),
            duration: parseInt(document.getElementById('lessonDuration').value)
        };

        if (!data.title || data.title.length > 50) {
            this.showError('lessonTitleError', 'Заголовок обязателен (макс. 50 символов)');
            isValid = false;
        }

        if (!data.content) {
            this.showError('lessonContentError', 'Содержание обязательно');
            isValid = false;
        }

        if (!data.duration || data.duration < 1 || data.duration > 4) {
            this.showError('lessonDurationError', 'Длительность должна быть от 1 до 4 часов');
            isValid = false;
        }

        if (data.video_link && !data.video_link.match(/^https:\/\/super-tube\.cc\/video\/v\d+$/)) {
            this.showError('lessonVideoError', 'Неверный формат ссылки SuperTube');
            isValid = false;
        }

        if (!isValid) return;

        // Проверка максимального количества уроков
        let lessons = JSON.parse(localStorage.getItem('lessons')) || [];
        const courseLessons = lessons.filter(l => l.course_id === data.course_id);
        
        if (courseLessons.length >= 5 && !lessonId) {
            this.showError('lessonTitleError', 'Максимум 5 уроков на курс');
            return;
        }

        // Сохранение урока
        if (lessonId) {
            // Обновление существующего урока
            const index = lessons.findIndex(l => l.id === parseInt(lessonId));
            if (index !== -1) {
                lessons[index] = { 
                    ...lessons[index], 
                    ...data,
                    id: parseInt(lessonId)
                };
            }
        } else {
            // Создание нового урока
            const newId = Math.max(0, ...lessons.map(l => l.id)) + 1;
            const order = courseLessons.length + 1;
            
            lessons.push({
                id: newId,
                ...data,
                order: order
            });
        }
        
        localStorage.setItem('lessons', JSON.stringify(lessons));
        this.closeLessonModal();
        this.loadLessons();
        this.showToast('Урок успешно сохранен!', 'success');
    }

    deleteLesson(lessonId) {
        if (!confirm('Вы уверены, что хотите удалить этот урок?')) return;
        
        // Проверка на активные записи
        const lessons = JSON.parse(localStorage.getItem('lessons')) || [];
        const lesson = lessons.find(l => l.id === lessonId);
        
        if (lesson) {
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            const activeOrders = orders.filter(o => 
                o.course_id === lesson.course_id && o.payment_status === 'success'
            );
            
            if (activeOrders.length > 0) {
                this.showToast('Нельзя удалить урок с активными записями!', 'error');
                return;
            }
        }
        
        // Удаление урока
        let updatedLessons = lessons.filter(l => l.id !== lessonId);
        localStorage.setItem('lessons', JSON.stringify(updatedLessons));
        
        this.loadLessons();
        this.showToast('Урок удален!', 'success');
    }

    loadStudents() {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const students = JSON.parse(localStorage.getItem('students')) || [];
        const courses = JSON.parse(localStorage.getItem('courses')) || [];
        const container = document.getElementById('studentsTable');
        
        // Обновление фильтра курсов
        const filter = document.getElementById('studentCourseFilter');
        filter.innerHTML = '<option value="">Все курсы</option>' + 
            courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        
        container.innerHTML = orders.map(order => {
            const student = students.find(s => s.id === order.user_id);
            const course = courses.find(c => c.id === order.course_id);
            
            return `
                <tr>
                    <td>${order.id}</td>
                    <td>
                        <strong>${student?.name || 'Студент'}</strong><br>
                        <small>ID: ${order.user_id}</small>
                    </td>
                    <td>${student?.email || ''}</td>
                    <td>${course?.name || 'Курс'}</td>
                    <td>${new Date(order.enrolled_at).toLocaleDateString('ru-RU')}</td>
                    <td>
                        <span class="status-badge ${order.payment_status}">
                            ${this.getStatusText(order.payment_status)}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            ${order.payment_status === 'success' && 
                              this.isCourseFinished(order.course_id) ? `
                                <button onclick="admin.generateCertificate(${order.id})" 
                                        class="btn-icon btn-certificate">
                                    <i class="fas fa-certificate"></i>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    filterStudents() {
        const courseId = document.getElementById('studentCourseFilter').value;
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const filteredOrders = courseId ? 
            orders.filter(o => o.course_id === parseInt(courseId)) : 
            orders;
        
        this.displayStudents(filteredOrders);
    }

    isCourseFinished(courseId) {
        const courses = JSON.parse(localStorage.getItem('courses')) || [];
        const course = courses.find(c => c.id === courseId);
        if (!course) return false;
        
        const endDate = this.parseDate(course.end_date);
        return new Date() > endDate;
    }

    generateCertificate(orderId) {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const order = orders.find(o => o.id === orderId);
        
        if (!order || order.payment_status !== 'success') {
            this.showToast('Нельзя сгенерировать сертификат!', 'error');
            return;
        }
        
        if (!this.isCourseFinished(order.course_id)) {
            this.showToast('Курс еще не завершен!', 'error');
            return;
        }
        
        // Генерация номера сертификата
        const certificateNumber = this.generateCertificateNumber(order);
        
        // Обновление заказа
        order.certificate_number = certificateNumber;
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Открытие сертификата
        window.open(`certificate.html?number=${certificateNumber}&order=${order.id}`, '_blank');
        
        this.showToast('Сертификат сгенерирован!', 'success');
        this.loadCertificates();
    }

    generateCertificateNumber(order) {
        // Имитация запроса к сервису сертификации
        const servicePart = this.generateRandomString(6).toUpperCase();
        const localPart = Math.random().toString().slice(2, 7) + '1'; // 5 цифр + 1
        return servicePart + localPart;
    }

    generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    loadCertificates() {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const certificates = orders.filter(o => o.certificate_number);
        const container = document.getElementById('certificatesList');
        
        container.innerHTML = certificates.map(order => `
            <div class="certificate-card">
                <div class="certificate-header">
                    <i class="fas fa-certificate"></i>
                    <div>
                        <h4>Сертификат № ${order.certificate_number}</h4>
                        <p>Заказ ID: ${order.id}</p>
                    </div>
                </div>
                <div class="certificate-actions">
                    <button onclick="window.open('certificate.html?number=${order.certificate_number}&order=${order.id}', '_blank')" 
                            class="btn btn-outline">
                        <i class="fas fa-eye"></i> Просмотр
                    </button>
                    <button onclick="window.open('certificate.html?number=${order.certificate_number}&order=${order.id}&print=true', '_blank')" 
                            class="btn btn-primary">
                        <i class="fas fa-print"></i> Печать
                    </button>
                </div>
            </div>
        `).join('');
    }

    parseDate(dateString) {
        const [day, month, year] = dateString.split('-');
        return new Date(year, month - 1, day);
    }

    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
        }
    }

    clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
    }

    clearCourseErrors() {
        ['nameError', 'descError', 'hoursError', 'priceError', 
         'startDateError', 'endDateError', 'imageError'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = '';
                el.style.display = 'none';
            }
        });
    }

    clearLessonErrors() {
        ['lessonTitleError', 'lessonContentError', 
         'lessonVideoError', 'lessonDurationError'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = '';
                el.style.display = 'none';
            }
        });
    }

    closeModal() {
        document.getElementById('courseModal').style.display = 'none';
        this.clearCourseErrors();
    }

    closeLessonModal() {
        document.getElementById('lessonModal').style.display = 'none';
        this.clearLessonErrors();
    }

    showToast(message, type = 'success') {
        // Создание элемента toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        // Показ toast
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Удаление через 3 секунды
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    editCourse(id) {
        this.showCourseForm(id);
    }

    editLesson(id) {
        this.showLessonForm(id);
    }
}

// Глобальная переменная для доступа из HTML
const admin = new AdminPanel();

// Глобальные функции для вызова из HTML
function showSection(sectionId) {
    admin.showSection(sectionId);
}

function logout() {
    admin.logout();
}

function showCourseForm(id = null) {
    admin.showCourseForm(id);
}

function closeModal() {
    admin.closeModal();
}

function closeLessonModal() {
    admin.closeLessonModal();
}

function filterLessons() {
    admin.filterLessons();
}

function filterStudents() {
    admin.filterStudents();
}