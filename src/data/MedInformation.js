  class MedInformation {
    constructor(gtin, expiry, lot, serial, section) {
        this.gtin = gtin || 'N/A';
        this.expiry = expiry || 'N/A';
        this.lot = lot || 'N/A';
        this.serial = serial || 'N/A';
        this.section = section || 'N/A'
    }
}
export default MedInformation;