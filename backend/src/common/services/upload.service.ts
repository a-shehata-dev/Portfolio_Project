import { HttpException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';

export type fileTypes = 'Document' | 'Image';
export type imageSize = 'Icon' | 'Image';
export const IMAGE_CONFIG = {
  Icon: { width: 128, height: 128, quality: 80 },
  Image: { width: 1280, height: 720, quality: 100 },
};
@Injectable()
export class UploadService {
  //?============================== Helper Function ==================================
  private async ensureDirectory(dir: string) {
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
  }

  //?============================== Helper Function ==================================
  private async safeDelete(filePahtInsidePublic: string) {
    const filePath = path.join(process.cwd(), 'public', filePahtInsidePublic);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
  }
  //?============================== Helper Function ==================================
  private getFileName(fullPath: string) {
    const fileName = path.basename(fullPath);
    return fileName;
  }

  //?==================================================================================
  async uploadFile(
    file: Express.Multer.File,
    type: fileTypes,
    savePathInsidePublic: string,
    oldFileToDelete: string | null,
    imageSize?: imageSize,
  ) {
    // ===========> Store file path in variable for multiple uses
    let filePath: string | null = null;

    // ===========> Checking for mandatory fields
    if (!file || !type || !savePathInsidePublic) {
      throw new HttpException(
        'File, type of file and save path are required',
        400,
      );
    }

    // ===========> if its an image, gotta have a size
    if (type == 'Image' && !imageSize) {
      throw new HttpException(
        'Image size type is required (icon or image)',
        400,
      );
    }

    // ==========> ensure directory exists
    await this.ensureDirectory(
      path.join(process.cwd(), 'public', savePathInsidePublic),
    );

    try {
      //! *********************** CASE 1 : PDF FILE (Document) *************************
      if (type == 'Document') {
        filePath = path.join(
          process.cwd(),
          'public',
          savePathInsidePublic,
          file.originalname,
        );
        fs.writeFile(filePath, file.buffer, (err) => {
          if (err) {
            throw new HttpException(err.message, 500);
          }
        });
        if (
          oldFileToDelete &&
          this.getFileName(oldFileToDelete) !==
            this.getFileName(`${type}/${file.originalname}`)
          // document can have meaningful names, so to avoid adding Date.now() to it, just check if same name then dont delete
          // because that may lead to delete the file just created as it has the same name
        ) {
          await this.safeDelete(oldFileToDelete);
        }

        return file.originalname;
      }

      //! *********************** CASE 2 : IMAGE FILE (Icon || Image) *************************
      else if (type == 'Image') {
        const { width, height, quality } = IMAGE_CONFIG[imageSize!];

        const ext = path.extname(file.originalname).toLowerCase();
        const baseName = path.parse(file.originalname).name;
        const fileName = `${Date.now()}-${baseName}${ext === '.svg' || ext === '.ico' ? ext : '.webp'}`;
        filePath = path.join(
          process.cwd(),
          'public',
          savePathInsidePublic,
          fileName,
        );
        if (ext === '.svg' || ext === '.ico') {
          // Keep original for SVG/ICO
          await fs.promises.writeFile(filePath, file.buffer);
        } else {
          const processedImageBuffer = await sharp(file.buffer)
            .resize(width, height, { fit: 'inside' })
            .webp({ quality, alphaQuality: 100, effort: 4 })
            .toBuffer();
          await fs.promises.writeFile(filePath, processedImageBuffer);
        }
        if (oldFileToDelete) {
          await this.safeDelete(oldFileToDelete);
        }
        return fileName;
      }
    } catch (err) {
      if (filePath) await this.safeDelete(filePath);
      throw err;
    }
  }
}
