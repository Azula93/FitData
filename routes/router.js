const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const connection = require('../database/db');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');




// router para las vistas
// se coloca authController.isAuthenticated para asegurar que el usuario si tiene las credenciales para ingresar al sistema, que si esta autenticado 
router.get('/', authController.isAuthenticated, (req, res) => {
    res.render('index', { user: req.user })
})

router.get('/login', (req, res) => {
    res.render('login', { alert: false });
})

router.get('/register', (req, res) => {
    res.render('register', { alert: false })
})

router.get('/panelcontrol', authController.isAuthenticated, (req, res) => {
    res.render('panelcontrol', { user: req.user })
})

router.get('/valoracion', authController.isAuthenticated, (req, res) => {
    res.render('valoracion', { user: req.user })
})

router.get('/pruebaEsfuerzo', authController.isAuthenticated, (req, res) => {
    res.render('pruebaEsfuerzo', { user: req.user })
})

router.get('/blog', authController.isAuthenticated, (req, res) => {
    res.render('blog', { user: req.user })
})

router.get('/formularios', authController.isAuthenticated, (req, res) => {
    res.render('formularios', { user: req.user })
})


// router.get('/misdatos', authController.isAuthenticated,  (req, res) => {

//     const userId = req.user.id;

//     connection.query('SELECT * FROM user_data WHERE user_id = ?', [userId], (error, results) => {
        
//         if (error) {
//             console.error('Error al obtener los datos:', error);
//             return res.status(500).send('Error en el servidor');
//         }

//         console.log('Datos del usuario:', results);

//         res.render('misdatos', { datos: results, user: req.user });
//     });
// })


// GENERA PDF

router.get('/misdatos',authController.isAuthenticated, (req, res) => {
    const userId = req.user.id;

    const query = 'SELECT imc, icc, gasto_energetico, macro, vo2,mets, expect_vida FROM user_data WHERE user_id = ?';
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error al recuperar los datos:', err);
            return res.status(500).send('Error al recuperar los datos');
        }

        res.render('misdatos', {
            datos: results[0] || {}, 
            user: req.user
        });
    });
});




// router.get('/generar-pdf', authController.isAuthenticated, (req, res) => {

//     try {
//         const userId = req.user.id;
//         const userName = req.user.nombreUsuario;

//         connection.query('SELECT * FROM user_data WHERE user_id = ?', [userId], (error, results) => {
//             if (error) {
//                 console.log(error);
//                 return res.status(500).send('Error al obtener los datos del usuario.');
//             }

//             // Crear el PDF
//             const doc = new PDFDocument();
//             doc.font('./public/font/Poppins-Regular.ttf');

//             // Establecer el encabezado Content-Type para mostrar el PDF en el navegador
//             res.setHeader('Content-Type', 'application/pdf');

//             // Establecer el encabezado Content-Disposition para mostrar el PDF en el navegador
//             res.setHeader('Content-Disposition', 'inline; filename="user_data.pdf"');

//             // Enviar el PDF directamente a la respuesta
//             doc.pipe(res);

//             doc.fontSize(25).text(`Resultados ${userName}`, { align: 'center' });

//             // Config TABLA
//             const tableTop = 140;
//             const itemHeight = 40;
//             const tableWidth = 530;
//             const columnWidth = tableWidth / 10;

//             doc.fontSize(12)
//                 // .text('Dato', 30, tableTop)
//                 .text('IMC |', 30, tableTop)
//                 .text('ICC |', 80, tableTop)
//                 .text('GET |', 130, tableTop)
//                 .text('CHOS |', 170, tableTop)
//                 .text('Proteínas |', 220, tableTop)
//                 .text('Grasas |', 290, tableTop)
//                 .text('VO2 |', 350, tableTop)
//                 .text('METS |', 405, tableTop)
//                 .text('Expect Vida |', 460, tableTop);

//             doc.moveDown();
//             results.forEach((row, index) => {
//                 const yPosition = tableTop + (index + 1) * itemHeight;

//                 doc
//                 .text(row.imc  || 'N/A', 30, yPosition)
//                 .text(row.icc || 'N/A', 85, yPosition)
//                 .text(row.gasto_energetico || 'N/A', 135, yPosition)
//                 .text(row.chos || 'N/A', 175, yPosition)
//                 .text(row.proteinas || 'N/A', 240, yPosition)
//                 .text(row.grasas || 'N/A', 305, yPosition)
//                 .text(row.vo2 || 'N/A', 355, yPosition)
//                 .text(row.mets || 'N/A', 410, yPosition)
//                 .text(row.expect_vida || 'N/A', 485, yPosition);
//             });

//             doc.end();

//             // Esperar a que el PDF se escriba antes de responder
//             doc.on('finish', () => {
//                 res.redirect(`Resultados_${userName}`); // Redirige para abrir el PDF en una nueva pestaña
//             });
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).send('Error en el servidor.');
//     }
// });

router.get('/generar-pdf', authController.isAuthenticated, (req, res) => {
    try {
        const userId = req.user.id;
        const userName = req.user.nombreUsuario;

        connection.query('SELECT * FROM user_data WHERE user_id = ?', [userId], (error, results) => {
            if (error) {
                console.log(error);
                return res.status(500).send('Error al obtener los datos del usuario.');
            }

            // Crear el PDF
            const doc = new PDFDocument();
            doc.font('./public/font/Poppins-Regular.ttf');

            // Establecer el encabezado Content-Type para mostrar el PDF en el navegador
            res.setHeader('Content-Type', 'application/pdf');

            // Establecer el encabezado Content-Disposition para mostrar el PDF en el navegador
            res.setHeader('Content-Disposition', 'inline; filename="user_data.pdf"');

            // Enviar el PDF directamente a la respuesta
            doc.pipe(res);

            doc.fontSize(25).text(`Resultados ${userName}`, { align: 'center' });

            // Config TABLA
            const tableTop = 160;
            const itemHeight = 65;
            const columnWidth = 150; // Ancho de cada columna
            const startX = 100; // Posición X para la columna "Valor"
            const startY = tableTop; // Posición Y para el inicio de la tabla

            // Encabezados de la tabla vertical
            doc.fontSize(12)
                .text('Valor', startX, startY)
                .text('Datos del Usuario', startX + columnWidth, startY);

            // Títulos de la tabla vertical
            doc.fontSize(10);
            const titles = [
                'IMC', 
                'ICC', 
                'GET', 
                'Macronutrientes', 
                'VO2', 
                'METS', 
                'Expect Vida'
            ];

            // Datos de los resultados
            const values = [
                results[0].imc || 'N/A',
                results[0].icc || 'N/A',
                results[0].gasto_energetico || 'N/A',
                results[0].macro || 'N/A',
                results[0].vo2 || 'N/A',
                results[0].mets || 'N/A',
                results[0].expect_vida || 'N/A'
            ];

            // Escribir los datos en el PDF
            titles.forEach((title, index) => {
                const yPosition = startY + (index + 1) * itemHeight;
                doc.text(title, startX, yPosition)
                   .text(values[index], startX + columnWidth, yPosition);
            });

            doc.end();

            // Esperar a que el PDF se escriba antes de responder
            doc.on('finish', () => {
                res.redirect(`Resultados_${userName}`); // Redirige para abrir el PDF en una nueva pestaña
            });
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error en el servidor.');
    }
});



// router para los metodos del controller 
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);


module.exports = router;