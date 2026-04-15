import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    setDoc, 
    serverTimestamp,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {

    // Auth Protection
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            // Not logged in -> redirect to login
            window.location.href = 'admin.html';
        } else {
            // Logged in
            document.body.style.opacity = '1';
            document.getElementById('user-email').textContent = user.email;
            
            // Load products into selects
            loadProductsToSelects();
        }
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        signOut(auth);
    });

    // --- PRODUCT MANAGEMENT ---
    const productForm = document.getElementById('product-form');
    const productAlert = document.getElementById('product-alert');
    const btnSaveProduct = document.getElementById('btn-save-product');

    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const category = document.getElementById('product-category').value;
        const name = document.getElementById('product-name').value.trim();

        if (!category || !name) return;

        try {
            btnSaveProduct.disabled = true;
            btnSaveProduct.textContent = 'Kaydediliyor...';

            await addDoc(collection(db, "products"), {
                name: name,
                category: category,
                createdAt: serverTimestamp()
            });

            showAlert(productAlert, 'success', 'Ürün başarıyla eklendi!');
            productForm.reset();
            
            // Reload selects with new product
            loadProductsToSelects();
            
        } catch (error) {
            console.error("Error adding product: ", error);
            showAlert(productAlert, 'error', 'Ürün eklenirken hata oluştu.');
        } finally {
            btnSaveProduct.disabled = false;
            btnSaveProduct.innerHTML = '<span>Sisteme Kaydet</span>';
        }
    });


    // --- MENU BUILDER ---
    const menuForm = document.getElementById('menu-form');
    const menuAlert = document.getElementById('menu-alert');
    const btnSaveMenu = document.getElementById('btn-save-menu');

    // Initially set date to today
    document.getElementById('menu-date').valueAsDate = new Date();

    menuForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const date = document.getElementById('menu-date').value; // Outputs YYYY-MM-DD
        const corba = document.getElementById('select-corbalar').value;
        const anaYemek = document.getElementById('select-ana-yemek').value;
        const yanYemek = document.getElementById('select-yan-yemek').value;
        const garnitur = document.getElementById('select-garnitur').value;

        if (!date || !corba || !anaYemek || !yanYemek || !garnitur) {
            showAlert(menuAlert, 'error', 'Lütfen tüm alanları doldurun.');
            return;
        }

        try {
            btnSaveMenu.disabled = true;
            btnSaveMenu.textContent = 'Kaydediliyor...';

            // Save menu document with ID = date (e.g., 2024-05-20)
            await setDoc(doc(db, "menus", date), {
                date: date,
                corba: corba,
                anaYemek: anaYemek,
                yanYemek: yanYemek,
                garnitur: garnitur,
                createdAt: serverTimestamp()
            });

            showAlert(menuAlert, 'success', date + ' tarihi için menü kaydedildi!');
        } catch (error) {
            console.error("Error saving menu: ", error);
            showAlert(menuAlert, 'error', 'Menü kaydedilirken bir hata oluştu.');
        } finally {
            btnSaveMenu.disabled = false;
            btnSaveMenu.textContent = 'Menüyü Kaydet';
        }
    });

    // Helper functions
    async function loadProductsToSelects() {
        const selects = {
            'corbalar': document.getElementById('select-corbalar'),
            'ana-yemek': document.getElementById('select-ana-yemek'),
            'yan-yemek': document.getElementById('select-yan-yemek'),
            'garnitur': document.getElementById('select-garnitur')
        };

        // Reset selects
        for (let key in selects) {
            selects[key].innerHTML = '<option value="" disabled selected>Seçiniz...</option>';
        }

        try {
            const querySnapshot = await getDocs(collection(db, "products"));
            
            // Populate them based on category
            querySnapshot.forEach((doc) => {
                const product = doc.data();
                if (selects[product.category]) {
                    const opt = document.createElement('option');
                    opt.value = product.name; // Can use product name directly for simple reading later
                    opt.textContent = product.name;
                    selects[product.category].appendChild(opt);
                }
            });
        } catch (error) {
            console.error("Error fetching products: ", error);
        }
    }

    function showAlert(element, type, message) {
        element.textContent = message;
        element.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');
        
        if (type === 'success') {
            element.classList.add('bg-green-100', 'text-green-800');
        } else {
            element.classList.add('bg-red-100', 'text-red-800');
        }
        
        setTimeout(() => {
            element.classList.add('hidden');
        }, 4000);
    }
});
