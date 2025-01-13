"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Input } from "@/components/ui/input"
import { title } from "process"
import { aspectRatioOptions, defaultValues, transformationTypes } from "@/constants"
import { CustomField } from "./CustomField"
import { useState, useTransition } from "react"
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils"
import { updateCredits } from "@/lib/actions/user.actions"

export const formSchema = z.object({
  title: z.string(),
  aspectRatio: z.string().optional(),
  color: z.string().optional(),
  prompt: z.string().optional(),
  publicId: z.string(),
})

const TransformationForm = ({ action, data = null, userId, type, creditBalance, config = null }: TransformationFormProps ) => {
  const transformationType = transformationTypes[type];
  const [image, setImage] = useState(data);
  const [newTransformation, setNewTransformation] = useState<Transformations | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTransforming, setIsTransforming] = useState(false)
  const [transformationConfig, setTransformationConfig] = useState(config)
  const [isPending, startTransition] = useTransition()

  const initialValues = data && action === 'Update' ? {
    title: data?.title,
    aspectRatio: data?.aspectRatio,
    color: data?.color,
    prompt: data?.prompt,
    publicId: data?.publicId,
  } : defaultValues

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  const onSelectFieldHandler = (value: string, onChangeField: (value: string) => void) => {
    const imageSize = aspectRatioOptions[value as AspectRatioKey]

    setImage((prevState: any) => ({
      ...prevState,
      aspectRatio: imageSize.width,
      height: imageSize.height,
    }))

    setNewTransformation(transformationType.config)

    return onChangeField(value)
  }

  const onInputChangeHandler = (
    field: string,
    value: string,
    onChangeField: (value: string) => void,
    type: string,
  ) => {
    debounce(() => {
      setNewTransformation((prevState: any) => ({
        ...prevState,
        [type]: {
          ...prevState?.[type],
          [field === 'prompt' ? 'prompt' : 'to']: value,
        },
      }))

      return onChangeField(value)
    }, 1000)
  }

  // todo: update credits
  const onTransformHandler = async () => {
    setIsTransforming(true);

    setTransformationConfig(
      deepMergeObjects(transformationConfig, newTransformation)
    )

    setNewTransformation(null)

    startTransition(async () => {
      // await updateCredits(userId, creditFee)
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <CustomField
          control={form.control}
          name="title"
          formLabel="Image Title"
          className="w-full"
          render={({ field }) => < Input {...field} className="input-field" />}
        />

        {type === 'fill' && (
          <CustomField
            control={form.control}
            name="aspectRatio"
            formLabel="Aspect Ratio"
            className="w-full"
            render={({ field }) => (
              <Select
                onValueChange={(value) => onSelectFieldHandler(value, field.onChange)}
              >
                <SelectTrigger className="select-field">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(aspectRatioOptions).map((key) => (
                    <SelectItem key={key} value={key} className="select-item">
                      {aspectRatioOptions[key as AspectRatioKey].label}
                    </SelectItem>
                   ))}
                </SelectContent>
              </Select>
            )}
          />
        )}

        {(type === 'remove' || type === 'recolor') && (
          <div className="prompt-field">
            <CustomField
              control={form.control}
              name="prompt"
              formLabel={
                type === 'remove'
                  ? 'Object to Remove'
                  : 'Object to Recolor'
              }
              className="w-full"
              render={({ field }) => (
                <Input
                  {...field}
                  className="input-field"
                  onChange={(e) => {
                    field.onChange(e);
                    onInputChangeHandler('prompt', e.target.value, field.onChange, type);
                  }}
                />
              )}
            />

            {type === 'recolor' && (
              <CustomField
                control={form.control}
                name="color"
                formLabel="Replacement  Color"
                className="w-full"
                render={({ field }) => (
                  <Input
                    {...field}
                    className="input-field"
                    onChange={(e) => {
                      field.onChange(e);
                      onInputChangeHandler('color', e.target.value, field.onChange, 'recolor ');
                    }}
                  />
                )}
              />
            )}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <Button
            type="button"
            className="submit-button capitalize"
            disabled={isTransforming || newTransformation === null}
            onClick={onTransformHandler}
          >
            {isTransforming ? 'Transforming...' : 'Apply Transformation'}
          </Button>


          <Button type="submit" className="submit-button capitalize" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Save Image'}
          </Button>

        </div>
      </form>
    </Form>
  )
}

export default TransformationForm