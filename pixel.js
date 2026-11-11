/**
 * =====================================================
 * PIXEL DA META + AVISO DE COOKIES (LGPD)
 * =====================================================
 * O pixel só é carregado depois que o visitante clica em
 * "Aceitar" no aviso. A escolha fica guardada no navegador.
 *
 * Configuração (no <head> do index.html, antes deste arquivo):
 *   window.PIXEL_CONFIG = { id: 'ID DO PIXEL', cor: '#cor-do-botao', corTexto: '#fff' };
 *
 * Eventos enviados (aparecem no Gerenciador de Eventos da Meta):
 *   PageView          - visita a página
 *   ViewContent       - viu a seção do cardápio
 *   Contact           - clicou no WhatsApp ou no telefone
 *   Schedule          - pediu reserva (formulário ou WhatsApp de reserva)
 *   InitiateCheckout  - clicou para pedir no iFood, Anota Aí ou Pede Aqui
 * =====================================================
 */
(function () {
    'use strict';

    var cfg = window.PIXEL_CONFIG || {};
    if (!cfg.id) return;

    var CHAVE = 'pixel-meta-consentimento';
    var carregado = false;

    // Fila do pixel (código oficial da Meta, sem carregar o script ainda)
    (function (f) {
        if (f.fbq) return;
        var n = f.fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = true;
        n.version = '2.0';
        n.queue = [];
    })(window);

    window.fbq('init', cfg.id);
    window.fbq('track', 'PageView');

    function carregarPixel() {
        if (carregado) return;
        carregado = true;
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://connect.facebook.net/en_US/fbevents.js';
        document.head.appendChild(s);
    }

    function lerEscolha() {
        try { return localStorage.getItem(CHAVE); } catch (e) { return null; }
    }

    function salvarEscolha(valor) {
        try { localStorage.setItem(CHAVE, valor); } catch (e) {}
    }

    function evento(nome, dados) {
        window.fbq('track', nome, dados || {});
    }

    if (lerEscolha() === 'sim') carregarPixel();

    /* ---------- Aviso de cookies ---------- */
    function montarAviso() {
        var cor = cfg.cor || '#222222';
        var corTexto = cfg.corTexto || '#ffffff';

        var estilo = document.createElement('style');
        estilo.textContent =
            '.aviso-cookies{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:760px;margin:0 auto;' +
            'display:flex;align-items:center;gap:14px 20px;flex-wrap:wrap;padding:16px 20px;border-radius:14px;' +
            'background:#ffffff;color:#2b2b2b;box-shadow:0 10px 36px rgba(0,0,0,.22);font-size:14px;line-height:1.5}' +
            '.aviso-cookies[hidden]{display:none}' +
            '.aviso-cookies p{flex:1 1 300px;margin:0;color:inherit}' +
            '.aviso-cookies a{color:inherit;text-decoration:underline}' +
            '.aviso-cookies-botoes{display:flex;gap:10px}' +
            '.aviso-cookies button{font:inherit;font-weight:600;border-radius:50px;padding:9px 20px;cursor:pointer;border:2px solid ' + cor + '}' +
            '.aviso-cookies .aceitar{background:' + cor + ';color:' + corTexto + '}' +
            '.aviso-cookies .recusar{background:transparent;color:' + cor + '}';
        document.head.appendChild(estilo);

        var aviso = document.createElement('div');
        aviso.className = 'aviso-cookies';
        aviso.setAttribute('role', 'dialog');
        aviso.setAttribute('aria-label', 'Aviso de cookies');
        aviso.innerHTML =
            '<p>Usamos cookies da Meta (Facebook e Instagram) para medir as visitas e o resultado dos nossos anúncios. ' +
            '<a href="#privacidade">Saiba mais</a></p>' +
            '<div class="aviso-cookies-botoes">' +
            '<button type="button" class="recusar">Recusar</button>' +
            '<button type="button" class="aceitar">Aceitar</button>' +
            '</div>';
        aviso.hidden = lerEscolha() !== null;
        document.body.appendChild(aviso);

        aviso.querySelector('.aceitar').addEventListener('click', function () {
            salvarEscolha('sim');
            carregarPixel();
            aviso.hidden = true;
        });

        aviso.querySelector('.recusar').addEventListener('click', function () {
            salvarEscolha('nao');
            aviso.hidden = true;
            // Se já tinha aceitado antes, a mudança vale a partir da próxima visita
        });

        // Links com data-preferencias-cookies reabrem o aviso
        document.querySelectorAll('[data-preferencias-cookies]').forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                aviso.hidden = false;
            });
        });
    }

    /* ---------- Eventos de conversão ---------- */
    function iniciarEventos() {
        // Cliques em links (WhatsApp, telefone e apps de delivery)
        document.addEventListener('click', function (e) {
            var link = e.target.closest ? e.target.closest('a[href]') : null;
            if (!link) return;
            var href = link.getAttribute('href') || '';

            if (/wa\.me|api\.whatsapp\.com/.test(href)) {
                if (link.dataset.msg === 'reserva') {
                    evento('Schedule', { content_name: 'Reserva pelo WhatsApp' });
                } else {
                    evento('Contact', { content_name: 'WhatsApp' });
                }
            } else if (href.indexOf('tel:') === 0) {
                evento('Contact', { content_name: 'Telefone' });
            } else if (/ifood\.com|anota\.ai|pedeaqui\.app/.test(href)) {
                var app = /ifood/.test(href) ? 'iFood' : /anota/.test(href) ? 'Anota Aí' : 'Pede Aqui';
                evento('InitiateCheckout', { content_name: 'Pedido ' + app });
            }
        }, true);

        // Formulário de reserva (abre o WhatsApp com os dados)
        var form = document.getElementById('reservaForm');
        if (form) {
            form.addEventListener('submit', function () {
                if (form.checkValidity()) evento('Schedule', { content_name: 'Reserva pelo formulário' });
            });
        }

        // Viu o cardápio (uma vez por visita)
        var cardapio = document.getElementById('cardapio');
        if (cardapio && 'IntersectionObserver' in window) {
            var obs = new IntersectionObserver(function (itens) {
                if (itens[0].isIntersecting) {
                    evento('ViewContent', { content_name: 'Cardápio' });
                    obs.disconnect();
                }
            }, { threshold: 0.4 });
            obs.observe(cardapio);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { montarAviso(); iniciarEventos(); });
    } else {
        montarAviso();
        iniciarEventos();
    }
})();
