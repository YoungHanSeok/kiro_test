/**
 * 배경화면 업로드 컴포넌트 (관리자 전용)
 */

import React, { useState } from 'react'
import { useAppContext } from '../../context'
import { uploadWallpaper } from '../../api'
import './WallpaperUpload.css'

interface WallpaperUploadProps {
  onClose: () => void
  onSuccess: () => void
}

export function WallpaperUpload({ onClose, onSuccess }: WallpaperUploadProps) {
  const { state } = useAppContext()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    theme: 'general'
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 파일 타입 검증
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드할 수 있습니다')
        return
      }

      // 파일 크기 검증 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('파일 크기는 10MB 이하여야 합니다')
        return
      }

      setSelectedFile(file)
      setError(null)

      // 미리보기 생성
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      setError('배경화면 파일을 선택해주세요')
      return
    }

    if (!formData.title.trim()) {
      setError('제목을 입력해주세요')
      return
    }

    if (!state.adminKey) {
      setError('관리자 인증이 필요합니다')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('wallpaper', selectedFile)
      uploadFormData.append('title', formData.title.trim())
      uploadFormData.append('description', formData.description.trim())
      uploadFormData.append('theme', formData.theme)
      
      // 태그 처리
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
      
      tags.forEach(tag => {
        uploadFormData.append('tags', tag)
      })

      await uploadWallpaper(state.adminKey, uploadFormData)
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('업로드 오류:', error)
      setError('업로드 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="wallpaper-upload-overlay">
      <div className="wallpaper-upload-modal">
        <div className="upload-header">
          <h2>배경화면 업로드</h2>
          <button 
            className="close-button"
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          {/* 파일 선택 */}
          <div className="form-group">
            <label htmlFor="wallpaper-file">배경화면 파일</label>
            <input
              id="wallpaper-file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isLoading}
            />
            {previewUrl && (
              <div className="file-preview">
                <img src={previewUrl} alt="미리보기" />
              </div>
            )}
          </div>

          {/* 제목 */}
          <div className="form-group">
            <label htmlFor="title">제목 *</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="배경화면 제목을 입력하세요"
              disabled={isLoading}
              required
            />
          </div>

          {/* 설명 */}
          <div className="form-group">
            <label htmlFor="description">설명</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="배경화면에 대한 설명을 입력하세요"
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* 태그 */}
          <div className="form-group">
            <label htmlFor="tags">태그</label>
            <input
              id="tags"
              name="tags"
              type="text"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="태그를 쉼표로 구분하여 입력하세요 (예: 자연, 풍경, 산)"
              disabled={isLoading}
            />
          </div>

          {/* 테마 */}
          <div className="form-group">
            <label htmlFor="theme">테마</label>
            <select
              id="theme"
              name="theme"
              value={formData.theme}
              onChange={handleInputChange}
              disabled={isLoading}
            >
              <option value="general">일반</option>
              <option value="nature">자연</option>
              <option value="abstract">추상</option>
              <option value="minimal">미니멀</option>
              <option value="dark">다크</option>
            </select>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="cancel-button"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedFile}
              className="upload-button"
            >
              {isLoading ? '업로드 중...' : '업로드'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}