/**
 * =====================================================
 * LA BELLA PIZZARIA
 * Script Principal
 * =====================================================
 *
 * ÍNDICE:
 * 1. Menu Mobile
 * 2. Scroll Suave
 * 3. FAQ Acordeão
 * 4. Header Scroll Effect
 * 5. Animações de Entrada
 * 6. Link WhatsApp
 *
 * =====================================================
 */

document.addEventListener('DOMContentLoaded', function() {

    /* =====================================================
       1. MENU MOBILE (HAMBÚRGUER)
       ===================================================== */

    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    /* =====================================================
       2. SCROLL SUAVE
       =====================================================
       Compensa a altura do header fixo.
    */

    const header = document.getElementById('header');

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                window.scrollTo({
                    top: target.offsetTop - header.offsetHeight,
                    behavior: 'smooth'
                });
            }
        });
    });

    /* =====================================================
       3. FAQ ACORDEÃO
       =====================================================
       Apenas uma pergunta fica aberta por vez.
    */

    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        item.querySelector('.faq-question').addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            faqItems.forEach(otherItem => otherItem.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });

    /* =====================================================
       4. HEADER SCROLL EFFECT
       ===================================================== */

    function atualizarHeader() {
        header.classList.toggle('scrolled', window.scrollY > 60);
    }

    window.addEventListener('scroll', atualizarHeader, { passive: true });
    atualizarHeader();

    /* =====================================================
       5. ANIMAÇÕES DE ENTRADA (SCROLL)
       =====================================================
       EDITÁVEL: Adicione ou remova seletores conforme necessário
    */

    const animateElements = document.querySelectorAll(
        '.servico-card, .depoimento-card, .faq-item, .feature, .galeria-item'
    );

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    /* =====================================================
       6. LINK WHATSAPP COM MENSAGEM PADRÃO
       =====================================================
       Links com data-msg="reserva" abrem com a mensagem de
       reserva; os demais, com a mensagem padrão.
       EDITÁVEL: Altere as mensagens abaixo.
    */

    const mensagens = {
        padrao: 'Olá! Vim pelo site da La Bella e gostaria de mais informações.',
        reserva: 'Olá! Quero reservar um espaço com vocês!'
    };

    document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
        const currentHref = link.getAttribute('href');
        const texto = mensagens[link.dataset.msg] || mensagens.padrao;

        if (!currentHref.includes('text=')) {
            link.setAttribute('href', `${currentHref}?text=${encodeURIComponent(texto)}`);
        }
    });

});
