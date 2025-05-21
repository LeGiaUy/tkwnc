// Ajax Navigation Handler
document.addEventListener('DOMContentLoaded', function() {
    // Xử lý tất cả các liên kết trong trang
    document.addEventListener('click', function(e) {
        // Kiểm tra nếu click vào thẻ a
        if (e.target.tagName === 'A' || e.target.closest('a')) {
            const link = e.target.tagName === 'A' ? e.target : e.target.closest('a');
            
            // Bỏ qua các liên kết đặc biệt
            if (link.getAttribute('href') === '#' || 
                link.getAttribute('target') === '_blank' ||
                link.getAttribute('data-bs-toggle') ||
                link.getAttribute('data-bs-target')) {
                return;
            }

            e.preventDefault();
            const url = link.getAttribute('href');
            
            // Hiển thị loading
            showLoading();

            // Gửi request Ajax
            fetch(url)
                .then(response => response.text())
                .then(html => {
                    // Cập nhật nội dung trang
                    updatePageContent(html);
                    // Cập nhật URL
                    history.pushState({}, '', url);
                    // Ẩn loading
                    hideLoading();
                })
                .catch(error => {
                    console.error('Error:', error);
                    hideLoading();
                    // Nếu có lỗi, chuyển hướng bình thường
                    window.location.href = url;
                });
        }
    });

    // Xử lý nút back/forward của trình duyệt
    window.addEventListener('popstate', function() {
        const url = window.location.href;
        showLoading();
        fetch(url)
            .then(response => response.text())
            .then(html => {
                updatePageContent(html);
                hideLoading();
            })
            .catch(error => {
                console.error('Error:', error);
                hideLoading();
                window.location.href = url;
            });
    });
});

// Hàm cập nhật nội dung trang
function updatePageContent(html) {
    // Tạo một DOM tạm thời để parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Cập nhật title
    document.title = doc.title;

    // Cập nhật main content
    const newMain = doc.querySelector('main');
    const currentMain = document.querySelector('main');
    if (newMain && currentMain) {
        currentMain.innerHTML = newMain.innerHTML;
    }

    // Cập nhật header
    const newHeader = doc.querySelector('header');
    const currentHeader = document.querySelector('header');
    if (newHeader && currentHeader) {
        currentHeader.innerHTML = newHeader.innerHTML;
    }

    // Cập nhật footer
    const newFooter = doc.querySelector('footer');
    const currentFooter = document.querySelector('footer');
    if (newFooter && currentFooter) {
        currentFooter.innerHTML = newFooter.innerHTML;
    }

    // Khởi tạo lại các script và event listener
    initializeScripts();
}

// Hàm hiển thị loading
function showLoading() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.display = 'block';
    }
}

// Hàm ẩn loading
function hideLoading() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.display = 'none';
    }
}

// Hàm khởi tạo lại các script và event listener
function initializeScripts() {
    // Khởi tạo lại AOS
    if (typeof AOS !== 'undefined') {
        AOS.init();
    }

    // Khởi tạo lại Swiper
    if (typeof Swiper !== 'undefined') {
        const swipers = document.querySelectorAll('.swiper');
        swipers.forEach(swiper => {
            const config = JSON.parse(swiper.querySelector('.swiper-config').textContent);
            new Swiper(swiper, config);
        });
    }

    // Khởi tạo lại các dropdown của Bootstrap
    const dropdowns = document.querySelectorAll('.dropdown-toggle');
    dropdowns.forEach(dropdown => {
        new bootstrap.Dropdown(dropdown);
    });

    // Khởi tạo lại các collapse của Bootstrap
    const collapses = document.querySelectorAll('[data-bs-toggle="collapse"]');
    collapses.forEach(collapse => {
        new bootstrap.Collapse(collapse);
    });

    // Scroll to top
    window.scrollTo(0, 0);
} 