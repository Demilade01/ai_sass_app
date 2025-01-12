import Header from '@/components/shared/Header'
import TransformationForm from '@/components/shared/TransformationForm';
import { transformationTypes } from '@/constants'
import React from 'react'

const AddTransformationTypePage = ({ params: { type }}: SearchParamProps) => {
  const transformation = transformationTypes[type];

  return (
    <>
      <Header
        title={transformation.title}
        subtitle= {transformation.subTitle}
      />
      <TransformationForm />
    </>
  )
}

export default AddTransformationTypePage