import multer from "multer";
import path from "path";

// Set Storage for uploaded files.
export default (storagePath = 'uploads/') => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, storagePath);
        },
        filename: (req,file, cb) => {
            let fileName = file.originalname.replace(/ /g, "_");
            cb(null, Date.now()+'_'+fileName);
        }
    });
    return multer({storage: storage});
}
