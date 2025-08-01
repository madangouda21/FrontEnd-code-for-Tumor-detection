document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    const heroSection = document.querySelector('#home .hero');
    const methodCards = document.querySelectorAll('.method-card');
    const authCards = document.querySelectorAll('.auth-card');
    const testimonials = document.querySelector('.testimonials');
    const resultSections = document.querySelectorAll('.result');

    const animateElementIn = (element) => {
        if (element) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            setTimeout(() => {
                element.style.transition = 'opacity 0.7s ease-out, transform 0.7s ease-out';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 100);
        }
    };

    const resetElementAnimation = (element) => {
        if (element) {
            element.style.transition = 'none';
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
        }
    };

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideInUp 0.7s ease-out forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    resultSections.forEach(section => {
        observer.observe(section);
    });

    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 1s ease-out forwards';
                entry.target.style.transform = 'translateY(0)';
                cardObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    methodCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        cardObserver.observe(card);
    });

    authCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        cardObserver.observe(card);
    });
});