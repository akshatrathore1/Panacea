import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { LanguageCode, readStoredLanguage } from './language'

const resources = {
    en: {
        translation: {
            // Navigation
            "home": "Home",
            "about": "About",
            "contact": "Contact",
            "login": "Login",
            "register": "Register",
            "dashboard": "Dashboard",
            "marketplace": "Marketplace",
            "analytics": "Analytics",

            // Platform
            "platform_name": "KrashiAalok",
            "platform_tagline": "Transparent Agricultural Supply Chain",
            "platform_description": "Track your agricultural produce from farm to consumer using blockchain technology",

            // User Roles
            "producer": "Producer",
            "intermediary": "Intermediary",
            "retailer": "Retailer",
            "consumer": "Consumer",
            "farmer": "Farmer",

            // Actions
            "connect_wallet": "Connect Wallet",
            "disconnect": "Disconnect",
            "create_batch": "Create Batch",
            "transfer_batch": "Transfer Batch",
            "view_history": "View History",
            "scan_qr": "Scan QR Code",
            "list_for_sale": "List for Sale",
            "search": "Search",
            "filter": "Filter",

            // Forms
            "name": "Name",
            "phone": "Phone Number",
            "location": "Location",
            "crop_type": "Crop Type",
            "variety": "Variety",
            "weight": "Weight (kg)",
            "quality_grade": "Quality Grade",
            "price_per_kg": "Price per KG",
            "submit": "Submit",
            "cancel": "Cancel",

            // Messages
            "wallet_not_connected": "Please connect your wallet first",
            "transaction_pending": "Transaction pending...",
            "transaction_success": "Transaction successful!",
            "transaction_failed": "Transaction failed",
            "loading": "Loading",

            // Dashboard
            "my_inventory": "My Listings",
            "recent_transactions": "Recent Transactions",
            "create_new_batch": "Create New Batch",
            "available_produce": "Available Produce",
            "purchase_history": "Purchase History",

            // Traceability
            "trace_journey": "Trace Journey",
            "from_farm_to_table": "From Farm to Table",
            "batch_created": "Batch Created",
            "ownership_transferred": "Ownership Transferred",
            "quality_verified": "Quality Verified",

            // Government schemes
            "subsidies": "Available Subsidies",
            "loans": "Loan Information",
            "schemes": "Government Schemes"
        }
    },
    hi: {
        translation: {
            // Navigation
            "home": "मुख्य पृष्ठ",
            "about": "के बारे में",
            "contact": "संपर्क",
            "login": "लॉगिन",
            "register": "पंजीकरण",
            "dashboard": "डैशबोर्ड",
            "marketplace": "बाज़ार",
            "analytics": "विश्लेषण",

            // Platform
            "platform_name": "कृषिआलोक",
            "platform_tagline": "पारदर्शी कृषि आपूर्ति श्रृंखला",
            "platform_description": "ब्लॉकचेन तकनीक का उपयोग करके अपने कृषि उत्पादों को खेत से उपभोक्ता तक ट्रैक करें",

            // User Roles
            "producer": "उत्पादक",
            "intermediary": "मध्यस्थ",
            "retailer": "खुदरा विक्रेता",
            "consumer": "उपभोक्ता",
            "farmer": "किसान",

            // Actions
            "connect_wallet": "वॉलेट कनेक्ट करें",
            "disconnect": "डिस्कनेक्ट",
            "create_batch": "बैच बनाएं",
            "transfer_batch": "बैच स्थानांतरित करें",
            "view_history": "इतिहास देखें",
            "scan_qr": "QR कोड स्कैन करें",
            "list_for_sale": "बिक्री के लिए सूचीबद्ध करें",
            "search": "खोजें",
            "filter": "फ़िल्टर",

            // Forms
            "name": "नाम",
            "phone": "फोन नंबर",
            "location": "स्थान",
            "crop_type": "फसल का प्रकार",
            "variety": "किस्म",
            "weight": "वजन (किलो)",
            "quality_grade": "गुणवत्ता श्रेणी",
            "price_per_kg": "प्रति किलो मूल्य",
            "submit": "जमा करें",
            "cancel": "रद्द करें",

            // Messages
            "wallet_not_connected": "कृपया पहले अपना वॉलेट कनेक्ट करें",
            "transaction_pending": "लेनदेन लंबित...",
            "transaction_success": "लेनदेन सफल!",
            "transaction_failed": "लेनदेन असफल",
            "loading": "लोड हो रहा है",

            // Dashboard
            "my_inventory": "मेरी सूचियाँ",
            "recent_transactions": "हाल के लेनदेन",
            "create_new_batch": "नया बैच बनाएं",
            "available_produce": "उपलब्ध उत्पाद",
            "purchase_history": "खरीद इतिहास",

            // Traceability
            "trace_journey": "यात्रा का पता लगाएं",
            "from_farm_to_table": "खेत से थाली तक",
            "batch_created": "बैच बनाया गया",
            "ownership_transferred": "स्वामित्व स्थानांतरित",
            "quality_verified": "गुणवत्ता सत्यापित",

            // Government schemes
            "subsidies": "उपलब्ध सब्सिडी",
            "loans": "ऋण जानकारी",
            "schemes": "सरकारी योजनाएं"
        }
    }
}

const fallbackLanguage: LanguageCode = 'en'
const initialLanguage: LanguageCode = typeof window !== 'undefined'
    ? readStoredLanguage(fallbackLanguage)
    : fallbackLanguage

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: initialLanguage,
        fallbackLng: fallbackLanguage,
        interpolation: {
            escapeValue: false
        }
    })

export default i18n