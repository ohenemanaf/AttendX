  // Data management with localStorage
        const STORAGE_KEY = 'attendx_logs_v1';
        let logs = [];
        let currentAction = null;

        // Force load from storage immediately
        function loadLogs() {
            const data = localStorage.getItem(STORAGE_KEY);
            logs = data ? JSON.parse(data) : [];
        }

        const saveToStorage = () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
        };

        const renderLogs = () => {
            const list = document.getElementById('recent-list');
            const counter = document.getElementById('counter');
            if (counter) counter.textContent = `${logs.length} logged`;
            
            if (list) {
                list.innerHTML = logs.slice(0, 3).map(log => `
                    <div class="log-item">
                        <div class="log-info">
                            <p>${log.name}</p>
                            <span>${log.index}</span>
                        </div>
                        <div class="log-time">${log.time}</div>
                    </div>
                `).join('');
            }
        };

        // Clock Logic
        const updateClock = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
            const display = document.getElementById('clock-display');
            if (display) display.innerHTML = timeString.replace(/:/g, '<span class="pulse-dots">:</span>');
            
            const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
            const dateDisplay = document.getElementById('date-display');
            if (dateDisplay) dateDisplay.textContent = now.toLocaleDateString(undefined, options);
        };

        // Form Handling
        document.getElementById('att-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const now = new Date();
            const entry = {
                name: document.getElementById('name').value,
                index: document.getElementById('index').value,
                time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                dateStamp: now.toLocaleDateString(),
                id: Date.now()
            };
            
            logs.unshift(entry);
            saveToStorage();
            renderLogs();
            
            document.getElementById('success-view').classList.add('show');
            document.getElementById('att-form').reset();
        });

        const closeOverlay = (id) => {
            document.getElementById(id).classList.remove('show');
            if(id === 'admin-view') {
                document.getElementById('admin-password').value = '';
                currentAction = null;
            }
        };

        const requestAdminAction = (type) => {
            if(!logs.length && type === 'export') return;
            currentAction = type;
            const title = document.getElementById('admin-title');
            if (title) title.textContent = type === 'reset' ? "WIPE ALL DATA?" : "VERIFY ADMIN";
            document.getElementById('admin-view').classList.add('show');
            document.getElementById('admin-password').focus();
        };

        const handleAdminVerification = () => {
            const pass = document.getElementById('admin-password').value;
            if(pass === 'admin') {
                if(currentAction === 'export') {
                    generatePDF();
                } else if(currentAction === 'reset') {
                    logs = [];
                    saveToStorage();
                    renderLogs();
                }
                closeOverlay('admin-view');
            } else {
                alert('Invalid Password');
                document.getElementById('admin-password').value = '';
            }
        };

        const generatePDF = () => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.setFillColor(2, 1, 10);
            doc.rect(0, 0, 210, 297, 'F');
            doc.setTextColor(0, 242, 255);
            doc.setFontSize(24);
            doc.text("ATTENDX SESSION REPORT", 14, 25);
            doc.autoTable({
                startY: 50,
                head: [['NAME', 'INDEX', 'TIME', 'DATE']],
                body: logs.map(l => [l.name.toUpperCase(), l.index, l.time, l.dateStamp]),
                theme: 'grid',
                styles: { fillColor: [15, 10, 30], textColor: [255, 255, 255] }
            });
            doc.save(`Attendance_${new Date().toLocaleDateString()}.pdf`);
        };

        // Initialize immediately
        loadLogs();
        
        window.addEventListener('DOMContentLoaded', () => {
            updateClock();
            setInterval(updateClock, 1000);
            renderLogs();
        });