document.addEventListener('DOMContentLoaded', () => {
    const trackPageView = (pageName) => {
        console.log(`Analytics: Page viewed - ${pageName}`);
    };

    const currentPage = document.querySelector('.page.active');
    if (currentPage) {
        trackPageView(currentPage.id);
    }

    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const pageId = e.target.dataset.page;
            trackPageView(pageId);
        });
    });

    const ctaButton = document.querySelector('.cta');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            console.log('Analytics: CTA button clicked - Start Detection');
        });
    }

    document.querySelectorAll('.btn.start-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const pagePrefix = btn.id.replace('StartBtn', '');
            console.log(`Analytics: Start Detection button clicked - ${pagePrefix}`);
        });
    });

    document.querySelectorAll('.btn.report-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const pagePrefix = btn.id.replace('ReportBtn', '');
            console.log(`Analytics: Report Generated - ${pagePrefix}`);
        });
    });

    const trackEvent = (category, action, label) => {
        console.log(`Analytics Event: Category=${category}, Action=${action}, Label=${label}`);
    };

    const userIcon = document.getElementById('userIcon');
    if (userIcon) {
        userIcon.addEventListener('click', () => {
            trackEvent('UserInteraction', 'Click', 'User Icon');
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', () => {
            trackEvent('Authentication', 'LoginAttempt', 'Form Submission');
        });
    }

    const createAccountForm = document.getElementById('createAccountForm');
    if (createAccountForm) {
        createAccountForm.addEventListener('submit', () => {
            trackEvent('Authentication', 'CreateAccountAttempt', 'Form Submission');
        });
    }
});