/**
 * RUMBO LABORAL - Lógica de Aplicación (SPA)
 * -----------------------------------------
 * Gestión de módulos: CV en vivo, Simulador, Checklist y Ofertas.
 */

document.addEventListener('DOMContentLoaded', () => {
    // === BARRA SUPERIOR DE ANUNCIO ===
    const announcementBar = document.getElementById('top-announcement');
    const closeAnnouncementBtn = document.getElementById('btn-close-announcement');
    
    if (localStorage.getItem('rumbo_hide_announcement') === 'true') {
        announcementBar.classList.add('hidden');
    }

    closeAnnouncementBtn.addEventListener('click', () => {
        announcementBar.classList.add('hidden');
        localStorage.setItem('rumbo_hide_announcement', 'true');
    });

    // === CONFIGURACIÓN Y ESTADO INICIAL ===
    const state = {
        currentTab: 'modulo-cv',
        checklist: JSON.parse(localStorage.getItem('rumbo_checklist')) || [],
        jobFilters: { search: '', type: 'todos', modality: 'todos' }
    };

    // === ELEMENTOS DEL DOM ===
    const tabs = document.querySelectorAll('.nav-tab');
    const modules = document.querySelectorAll('.module-section');
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');

    // === NAVEGACIÓN SPA ===
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.target;
            
            // Actualizar Tabs
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            // Actualizar Módulos
            modules.forEach(m => {
                m.classList.remove('active');
                m.setAttribute('hidden', '');
            });
            const targetModule = document.getElementById(target);
            targetModule.classList.add('active');
            targetModule.removeAttribute('hidden');

            state.currentTab = target;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // === MÓDULO 1: GENERADOR DE CV ===
    const cvForm = document.getElementById('cv-form');
    const cvInputs = cvForm.querySelectorAll('input, textarea');
    
    // Función para actualizar la vista previa en vivo
    const updateCVPreview = () => {
        // Mapeo simple de ID de input -> ID de preview
        const mapping = {
            'input-nombre': 'preview-nombre',
            'input-titulo-deseado': 'preview-titulo',
            'input-email': 'preview-email',
            'input-telefono': 'preview-telefono',
            'input-ubicacion': 'preview-ubicacion',
            'input-redes': 'preview-redes',
            'input-perfil': 'preview-perfil',
            'input-colegio': 'preview-colegio',
            'input-orientacion': 'preview-orientacion',
            'input-anio-egreso': 'preview-anio-egreso',
            'input-logro-academico': 'preview-logro-academico',
            'input-proj1-nombre': 'preview-proj1-nombre',
            'input-proj1-rol': 'preview-proj1-rol',
            'input-proj1-desc': 'preview-proj1-desc',
            'input-proj2-nombre': 'preview-proj2-nombre',
            'input-proj2-rol': 'preview-proj2-rol',
            'input-proj2-desc': 'preview-proj2-desc',
            'input-idiomas': 'preview-idiomas',
            'input-intereses': 'preview-intereses'
        };

        for (const [inputId, previewId] of Object.entries(mapping)) {
            const input = document.getElementById(inputId);
            const preview = document.getElementById(previewId);
            if (input && preview) {
                preview.textContent = input.value || (input.placeholder.includes('Ej.') ? '' : '---');
            }
        }

        // Actualizar Tags de Habilidades (Blandas)
        const softSkills = document.getElementById('input-soft-skills').value.split(',').map(s => s.trim()).filter(s => s);
        const softContainer = document.getElementById('preview-soft-skills-tags');
        softContainer.innerHTML = softSkills.map(s => `<li class="skill-tag">${s}</li>`).join('');

        // Actualizar Tags de Habilidades (Técnicas)
        const hardSkills = document.getElementById('input-hard-skills').value.split(',').map(s => s.trim()).filter(s => s);
        const hardContainer = document.getElementById('preview-hard-skills-tags');
        hardContainer.innerHTML = hardSkills.map(s => `<li class="skill-tag">${s}</li>`).join('');
    };

    // Listeners para actualización en vivo
    cvInputs.forEach(input => {
        input.addEventListener('input', updateCVPreview);
    });

    // Botones de acción CV
    document.getElementById('btn-print-cv').addEventListener('click', () => {
        window.print();
    });

    document.getElementById('btn-reset-cv').addEventListener('click', () => {
        if(confirm('¿Estás seguro de que quieres limpiar todos los campos del CV?')) {
            cvForm.reset();
            updateCVPreview();
            showToast('Formulario reiniciado');
        }
    });

    document.getElementById('btn-load-sample-cv').addEventListener('click', () => {
        // El HTML ya tiene valores por defecto que se ven al inicio
        showToast('Ejemplo cargado correctamente');
        updateCVPreview();
    });

    // Inicializar preview del CV
    updateCVPreview();


    // === MÓDULO 2: SIMULADOR DE ENTREVISTA ===
    const interviewData = [
        {
            id: 1,
            category: 'presentacion',
            question: 'Háblame de ti, ¿quién eres?',
            why: 'El reclutador busca conocer tu capacidad de síntesis, tus intereses actuales y si tienes claridad sobre tu etapa (egresado).',
            good: 'Menciona tu formación reciente, qué te motiva de este puesto específico y destaca 2 fortalezas actitudinales (ej. compromiso y ganas de aprender).',
            bad: 'Dar detalles demasiado personales (familia, mascotas) o simplemente decir "No sé qué decir, acabo de terminar la escuela".'
        },
        {
            id: 2,
            category: 'experiencia',
            question: 'No tienes experiencia previa, ¿cómo sabemos que puedes hacer el trabajo?',
            why: 'Evalúan tu confianza y si valoras tus aprendizajes escolares como habilidades transferibles.',
            good: 'Habla de tus proyectos escolares, pasantías, voluntariados o deportes. Ejemplo: "En la escuela lideré el equipo de la feria de economía, donde aprendí a manejar presupuestos y trabajar bajo presión".',
            bad: 'Confirmar que no sabes nada: "Es verdad, no sé hacer nada todavía pero aprendo rápido".'
        },
        {
            id: 3,
            category: 'situacional',
            question: '¿Qué harías si tienes una tarea que no sabes cómo resolver?',
            why: 'Buscan autonomía equilibrada con capacidad de pedir ayuda.',
            good: 'Intentaría buscar información por mi cuenta primero, pero si veo que me demoro demasiado, consultaría a mi supervisor para no cometer errores, mostrando proactividad.',
            bad: 'Quedarme esperando a que alguien se dé cuenta o hacerlo a mi manera aunque esté mal.'
        },
        {
            id: 4,
            category: 'actitud',
            question: '¿Cuáles son tus mayores fortalezas y debilidades?',
            why: 'Miden tu autoconocimiento y honestidad.',
            good: 'Fortaleza: "Mi puntualidad y adaptabilidad". Debilidad: "A veces me pongo nervioso al hablar en público, por eso practico mis presentaciones antes".',
            bad: 'Decir que no tienes debilidades o decir una que sea fatal para el puesto (ej. "Llego tarde siempre").'
        },
        {
            id: 5,
            category: 'experiencia',
            question: '¿Por qué deberíamos elegirte a ti y no a otro joven egresado?',
            why: 'Buscan ese "plus" de motivación o encaje con la cultura de la empresa.',
            good: 'Enfócate en tu compromiso genuino: "A diferencia de otros, estoy muy enfocado en hacer de esta mi primera gran experiencia y estoy dispuesto a dar el 110% para aprender los procesos".',
            bad: 'Porque necesito el dinero o porque vivo cerca.'
        },
        {
            id: 6,
            category: 'actitud',
            question: '¿Dónde te ves en los próximos 2 años?',
            why: 'Evalúan si tienes metas o si este trabajo es solo algo pasajero que no te importa.',
            good: 'Menciona tu deseo de haber crecido en la empresa, haber aprendido nuevas herramientas y quizás estar estudiando algo relacionado.',
            bad: 'No tengo idea, vivo el día a día.'
        }
    ];

    const interviewContainer = document.getElementById('interview-cards-container');
    const filterPills = document.querySelectorAll('.filter-pill');

    const renderInterviewCards = (category = 'todas') => {
        interviewContainer.innerHTML = '';
        const filtered = category === 'todas' ? interviewData : interviewData.filter(i => i.category === category);
        
        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = 'interview-card';
            card.innerHTML = `
                <span class="card-category-tag">${item.category.replace('presentacion', 'Presentación').replace('experiencia', 'Sin Experiencia').replace('situacional', 'Situacional').replace('actitud', 'Actitud')}</span>
                <h4 class="interview-question">${item.question}</h4>
                <div class="card-footer">
                    <span>Ver cómo responder</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
                <div class="card-expanded-content">
                    <div class="content-block">
                        <h5><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg> ¿Por qué preguntan esto?</h5>
                        <p>${item.why}</p>
                    </div>
                    <div class="content-block">
                        <h5>✅ Respuesta Ganadora</h5>
                        <div class="response-box good">${item.good}</div>
                    </div>
                    <div class="content-block">
                        <h5>❌ Lo que debes evitar</h5>
                        <div class="response-box bad">${item.bad}</div>
                    </div>
                    <button class="btn-close-card">Cerrar</button>
                </div>
            `;

            card.addEventListener('click', (e) => {
                if(!card.classList.contains('expanded')) {
                    card.classList.add('expanded');
                }
            });

            card.querySelector('.btn-close-card').addEventListener('click', (e) => {
                e.stopPropagation();
                card.classList.remove('expanded');
            });

            interviewContainer.appendChild(card);
        });
    };

    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            renderInterviewCards(pill.dataset.category);
        });
    });

    renderInterviewCards();


    // === MÓDULO 3: CHECKLIST ===
    const tasksData = [
        { id: 1, group: 'Documentación', title: 'Tramitar DNI actualizado', desc: 'Asegúrate de tener tu documento vigente y en buen estado.' },
        { id: 2, group: 'Documentación', title: 'Obtener Constancia de CUIL', desc: 'Descárgala desde la web de ANSES.' },
        { id: 3, group: 'Documentación', title: 'Título Secundario / Constancia', desc: 'Ten a mano la constancia de título en trámite o el analítico.' },
        { id: 4, group: 'Preparación CV', title: 'Escribir tu Perfil Profesional', desc: 'Define quién eres y qué buscas en 3 líneas.' },
        { id: 5, group: 'Preparación CV', title: 'Listar 3 Proyectos Escolares', desc: 'Sustituye la falta de experiencia con logros académicos.' },
        { id: 6, group: 'Preparación CV', title: 'Revisar Ortografía', desc: 'Un CV con errores causa una mala primera impresión.' },
        { id: 7, group: 'Búsqueda Activa', title: 'Crear perfil en LinkedIn', desc: 'Sigue a empresas de tu interés y completa tu perfil.' },
        { id: 8, group: 'Búsqueda Activa', title: 'Configurar Alertas de Empleo', desc: 'Usa portales como Bumeran, Computrabajo o LinkedIn.' },
        { id: 9, group: 'Búsqueda Activa', title: 'Identificar 5 Empresas', desc: 'Haz una lista de lugares donde te gustaría trabajar.' },
        { id: 10, group: 'La Entrevista', title: 'Practicar Presentación de 1 min', desc: 'Ensaya frente al espejo tu "elevator pitch".' },
        { id: 11, group: 'La Entrevista', title: 'Preparar Vestimenta', desc: 'Ten lista ropa limpia y formal-casual.' },
        { id: 12, group: 'La Entrevista', title: 'Investigar la Empresa', desc: 'Nunca vayas a una entrevista sin saber qué hace la empresa.' }
    ];

    const checklistContainer = document.getElementById('checklist-groups-container');
    const progressBar = document.getElementById('checklist-progress-bar');
    const progressText = document.getElementById('checklist-percentage');
    const fractionText = document.getElementById('checklist-fraction');
    const badgeCounter = document.getElementById('checklist-counter-badge');
    const statusMsg = document.getElementById('checklist-status-message');

    const updateChecklistUI = () => {
        const completedCount = state.checklist.length;
        const total = tasksData.length;
        const percentage = Math.round((completedCount / total) * 100);

        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `${percentage}%`;
        fractionText.textContent = `${completedCount} de ${total} completadas`;
        badgeCounter.textContent = `${completedCount}/${total}`;

        if (percentage === 100) statusMsg.textContent = '¡Excelente! Estás 100% listo para tu primer empleo.';
        else if (percentage > 50) statusMsg.textContent = '¡Vas por muy buen camino! Sigue así.';
        else statusMsg.textContent = '¡Comenzando tu camino laboral!';

        // Guardar persistencia
        localStorage.setItem('rumbo_checklist', JSON.stringify(state.checklist));
    };

    const renderChecklist = () => {
        checklistContainer.innerHTML = '';
        const groups = [...new Set(tasksData.map(t => t.group))];

        groups.forEach(groupName => {
            const groupEl = document.createElement('div');
            groupEl.className = 'checklist-group';
            groupEl.innerHTML = `
                <div class="group-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    <h3>${groupName}</h3>
                </div>
                <div class="task-list"></div>
            `;

            const list = groupEl.querySelector('.task-list');
            tasksData.filter(t => t.group === groupName).forEach(task => {
                const isCompleted = state.checklist.includes(task.id);
                const taskEl = document.createElement('div');
                taskEl.className = `task-item ${isCompleted ? 'completed' : ''}`;
                taskEl.innerHTML = `
                    <div class="task-checkbox">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <div class="task-content">
                        <span class="task-title">${task.title}</span>
                        <span class="task-desc">${task.desc}</span>
                    </div>
                `;

                taskEl.addEventListener('click', () => {
                    if (state.checklist.includes(task.id)) {
                        state.checklist = state.checklist.filter(id => id !== task.id);
                    } else {
                        state.checklist.push(task.id);
                    }
                    taskEl.classList.toggle('completed');
                    updateChecklistUI();
                });

                list.appendChild(taskEl);
            });

            checklistContainer.appendChild(groupEl);
        });
    };

    document.getElementById('btn-check-all').addEventListener('click', () => {
        state.checklist = tasksData.map(t => t.id);
        renderChecklist();
        updateChecklistUI();
        showToast('¡Todas las tareas completadas!');
    });

    document.getElementById('btn-reset-checklist').addEventListener('click', () => {
        if(confirm('¿Quieres reiniciar tu progreso?')) {
            state.checklist = [];
            renderChecklist();
            updateChecklistUI();
            showToast('Progreso reiniciado');
        }
    });

    renderChecklist();
    updateChecklistUI();


    // === MÓDULO 4: PORTAL DE OFERTAS ===
    const jobsData = [
        { id: 1, title: 'Cajero/a Trainee', company: 'Supermercados Global', type: 'Trainee', modality: 'Presencial', location: 'CABA', tags: ['Atención', 'Manejo de caja', 'Full-time'], desc: 'Buscamos jóvenes proactivos para su primera experiencia laboral. No requiere experiencia previa. Brindamos capacitación paga sobre sistemas de cobro.' },
        { id: 2, title: 'Asistente Administrativo Jr.', company: 'Estudio Contable & Asociados', type: 'Pasantía', modality: 'Híbrido', location: 'Córdoba', tags: ['Excel', 'Archivo', 'Part-time'], desc: 'Pasantía de 20hs semanales ideal para estudiantes. Apoyo en carga de facturas y organización de archivos digitales.' },
        { id: 3, title: 'Vendedor/a de Salón', company: 'Tiendas Urban Style', type: 'Medio Tiempo', modality: 'Presencial', location: 'Rosario', tags: ['Ventas', 'Moda', 'Comunicación'], desc: '¡Sumate a nuestro equipo de ventas! Buscamos chicos/as con buena onda y ganas de aprender sobre moda y atención al cliente.' },
        { id: 4, title: 'Data Entry / Soporte', company: 'TechSolutions SRL', type: 'Trainee', modality: 'Remoto', location: 'Remoto', tags: ['PC', 'Inglés básico', 'Full-time'], desc: 'Oportunidad 100% remota para cargar datos en nuestra plataforma. Requerimos manejo de PC y excelente ortografía.' },
        { id: 5, title: 'Auxiliar de Depósito', company: 'Logística Express', type: 'Medio Tiempo', modality: 'Presencial', location: 'GBA Norte', tags: ['Organización', 'Físico', 'Turno Mañana'], desc: 'Tareas de picking y embalaje de pedidos. Horarios fijos de 08 a 12hs. Ideal primer empleo cerca de casa.' },
        { id: 6, title: 'Recepcionista Pasantía', company: 'Centro Médico Salud', type: 'Pasantía', modality: 'Presencial', location: 'Mendoza', tags: ['Atención', 'Turnos', 'Empatía'], desc: 'Buscamos egresados para atención en recepción. Jornada reducida. Valoramos buen trato y responsabilidad.' }
    ];

    const jobsGrid = document.getElementById('jobs-grid-container');
    const jobCounterText = document.getElementById('jobs-count-text');
    const jobModal = document.getElementById('job-modal-backdrop');
    const jobModalContent = document.getElementById('modal-content-body');
    
    const renderJobs = () => {
        const filtered = jobsData.filter(job => {
            const matchesSearch = job.title.toLowerCase().includes(state.jobFilters.search.toLowerCase()) || 
                                 job.company.toLowerCase().includes(state.jobFilters.search.toLowerCase()) ||
                                 job.tags.some(t => t.toLowerCase().includes(state.jobFilters.search.toLowerCase()));
            const matchesType = state.jobFilters.type === 'todos' || job.type === state.jobFilters.type;
            const matchesModality = state.jobFilters.modality === 'todos' || job.modality === state.jobFilters.modality;
            return matchesSearch && matchesType && matchesModality;
        });

        jobsGrid.innerHTML = '';
        jobCounterText.textContent = `Mostrando ${filtered.length} vacantes disponibles`;

        if (filtered.length === 0) {
            jobsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--gray-400);">No se encontraron vacantes con esos filtros.</div>';
            return;
        }

        filtered.forEach(job => {
            const card = document.createElement('div');
            card.className = 'job-card';
            card.innerHTML = `
                <div class="job-card-header">
                    <div class="company-logo-placeholder">${job.company.charAt(0)}</div>
                    <span class="job-badge job-badge-${job.type.toLowerCase().split(' ')[0]}">${job.type}</span>
                </div>
                <div>
                    <h3 class="job-title">${job.title}</h3>
                    <p class="job-company">${job.company}</p>
                </div>
                <div class="job-meta">
                    <span class="job-meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${job.location}</span>
                    <span class="job-meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg> ${job.modality}</span>
                </div>
                <p class="job-description-short">${job.desc}</p>
                <div class="job-tags">
                    ${job.tags.map(t => `<span class="job-tag">#${t}</span>`).join('')}
                </div>
                <button class="btn btn-primary btn-postular" style="margin-top: auto; width: 100%; justify-content: center;">Postularme ahora</button>
            `;

            card.querySelector('.btn-postular').addEventListener('click', () => openJobModal(job));
            jobsGrid.appendChild(card);
        });
    };

    const openJobModal = (job) => {
        jobModalContent.innerHTML = `
            <div class="success-illustration">📄</div>
            <h2 class="modal-title">Postulación para ${job.title}</h2>
            <p style="margin-bottom: 1.5rem; color: var(--gray-600);">Se enviará tu Currículum Vitae generado en el Módulo 1 directamente al equipo de selección de <strong>${job.company}</strong>.</p>
            
            <div style="background: var(--gray-50); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--gray-200); margin-bottom: 2rem;">
                <p style="font-size: 0.875rem; margin-bottom: 0.5rem;"><strong>Resumen del CV a enviar:</strong></p>
                <p style="font-size: 0.8125rem;">Nombre: ${document.getElementById('input-nombre').value}</p>
                <p style="font-size: 0.8125rem;">Email: ${document.getElementById('input-email').value}</p>
            </div>

            <div style="display: flex; gap: 1rem;">
                <button class="btn btn-secondary" style="flex: 1; justify-content: center;" id="btn-cancel-postulation">Cancelar</button>
                <button class="btn btn-primary" style="flex: 2; justify-content: center;" id="btn-confirm-postulation">Confirmar Postulación</button>
            </div>
        `;

        jobModal.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';

        document.getElementById('btn-cancel-postulation').addEventListener('click', closeJobModal);
        document.getElementById('btn-confirm-postulation').addEventListener('click', () => {
            jobModalContent.innerHTML = `
                <div class="success-illustration">🎉</div>
                <h2 class="modal-title" style="text-align: center;">¡Postulación Exitosa!</h2>
                <p style="text-align: center; color: var(--gray-600); margin-bottom: 2rem;">Tu información ha sido enviada. Esto es una simulación, pero así de fácil será cuando estés listo.</p>
                <button class="btn btn-primary" style="width: 100%; justify-content: center;" id="btn-finish-modal">Volver al portal</button>
            `;
            document.getElementById('btn-finish-modal').addEventListener('click', closeJobModal);
            showToast('Postulación enviada correctamente');
        });
    };

    const closeJobModal = () => {
        jobModal.setAttribute('hidden', '');
        document.body.style.overflow = '';
    };

    document.getElementById('modal-close-btn').addEventListener('click', closeJobModal);
    jobModal.addEventListener('click', (e) => { if(e.target === jobModal) closeJobModal(); });

    // Listeners de filtros
    document.getElementById('job-search-input').addEventListener('input', (e) => {
        state.jobFilters.search = e.target.value;
        const clearBtn = document.getElementById('btn-clear-search');
        if (e.target.value) clearBtn.removeAttribute('hidden');
        else clearBtn.setAttribute('hidden', '');
        renderJobs();
    });

    document.getElementById('btn-clear-search').addEventListener('click', () => {
        const input = document.getElementById('job-search-input');
        input.value = '';
        state.jobFilters.search = '';
        document.getElementById('btn-clear-search').setAttribute('hidden', '');
        renderJobs();
    });

    document.getElementById('filter-job-type').addEventListener('change', (e) => {
        state.jobFilters.type = e.target.value;
        renderJobs();
    });

    document.getElementById('filter-job-modality').addEventListener('change', (e) => {
        state.jobFilters.modality = e.target.value;
        renderJobs();
    });

    renderJobs();


    // === HELPERS ===
    function showToast(message) {
        toastMsg.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
});
